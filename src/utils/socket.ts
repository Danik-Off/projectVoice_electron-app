import { io, type Socket } from 'socket.io-client';
import { getCookie } from './cookie';
import { SocketClientState, type SocketClientStateType } from '../types/socket.types';
import { iceServers } from '../configs/iceServers';

class SocketClient {
    public users = [];

    public onStateChange: ((state: SocketClientStateType) => void) | null = null;

    // Getter for state
    public get state(): SocketClientStateType {
        return this._state;
    }

    // Public setter for state
    public set state(newState: SocketClientStateType) {
        this._state = newState; // Update the state
        if (this.onStateChange != null) {
            this.onStateChange(this._state); // Invoke the handler if set
        }
    }

    private _state: SocketClientStateType;

    private token: string;
    private socket: Socket | null;
    private peerConnections: Record<string, RTCPeerConnection>; // Storage for multiple peer connections
    private localStream: MediaStream | null;
    private remoteStreams: Record<string, MediaStream>; // Store remote user streams

    public isMuteMicro = false;

    private readonly streamConstraints = {
        audio: true
    };

    constructor() {
        this.token = getCookie('token') ?? '';
        this.socket = null;
        this.peerConnections = {};
        this.localStream = null;
        this.remoteStreams = {};
        this._state = SocketClientState.INIT;
    }

    public muteMicrophone() {
        if (this.localStream != null) {
            this.localStream.getAudioTracks().forEach((track) => {
                // eslint-disable-next-line no-param-reassign -- Необходимо изменить свойство enabled для MediaStreamTrack
                track.enabled = false; // Mute the audio track
            });
            this.socket?.emit('mute');
            this.isMuteMicro = true;
        }
    }

    public unmuteMicrophone() {
        if (this.localStream != null) {
            this.localStream.getAudioTracks().forEach((track) => {
                // eslint-disable-next-line no-param-reassign -- Необходимо изменить свойство enabled для MediaStreamTrack
                track.enabled = true; // Unmute the audio track
            });
            this.socket?.emit('unmute');
            this.isMuteMicro = false;
        }
    }

    public connect(channelId: number) {
        if (this.socket?.connected === true) {
            return;
        }

        // const url = `https://projectvoice.suzenebl.ru`;
        const url = 'http://77.222.58.224:5555';
        this.socket = io(url, {
            path: '/socket',
            query: { token: this.token },
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true
        });

        this.socket.on('connect', () => {
            this.socket?.emit('join-room', channelId, this.token);
        });

        this.socket.on('created', async () => {
            await this.initializeMedia(); // Initialize media
        });

        this.socket.on('user-connected', async (user: { socketId: string }) => {
            await this.initializeMedia(); // Initialize media
            this.createOffer(user.socketId).catch(() => {
                // Error handled in createOffer
            }); // Initiate connection with the new user
        });

        this.socket.on('user-disconnected', (socketId: string) => {
            this.disconnectPeer(socketId); // Close connection with the disconnected user
        });

        this.socket.on(
            'signal',
            (data: { from: string; type: string; sdp?: string; candidate?: RTCIceCandidateInit }) => {
                this.handleSignal(data).catch(() => {
                    // Error handled in handleSignal
                });
            }
        );

        this.socket.on('connect_error', () => {
            // Ошибка Socket.IO подключения
        });

        this.socket.on('disconnect', () => {
            // Соединение с Socket.IO закрыто
        });
    }

    private async initializeMedia() {
        this.state = SocketClientState.MEDIA_INITIALIZING;
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia(this.streamConstraints);
            this.state = SocketClientState.MEDIA_INITIALIZED;
            if (this.localStream != null) {
                for (const socketId in this.peerConnections) {
                    if (Object.hasOwn(this.peerConnections, socketId)) {
                        this.localStream.getTracks().forEach((audioTrack) => {
                            if (this.localStream != null) {
                                this.peerConnections[socketId].addTrack(audioTrack, this.localStream);
                            }
                        });
                    }
                }
            }
            if (this.isMuteMicro && this.localStream != null) {
                this.localStream.getAudioTracks().forEach((track) => {
                    // eslint-disable-next-line no-param-reassign -- Необходимо изменить свойство enabled для MediaStreamTrack
                    track.enabled = false; // Mute the audio track
                });
            }
        } catch {
            // Ошибка доступа к локальному медиа
            this.state = SocketClientState.MEDIA_ERROR;
        }
    }

    private createPeerConnection(targetUserId: string): RTCPeerConnection {
        this.state = SocketClientState.PEER_CONNECTION_CREATING;
        const peerConnection = new RTCPeerConnection({
            iceServers
        });

        peerConnection.onicecandidate = (iceEvent) => {
            if (iceEvent.candidate != null) {
                this.socket?.emit('signal', {
                    to: targetUserId,
                    type: 'candidate',
                    candidate: iceEvent.candidate
                });
            }
        };

        peerConnection.ontrack = (trackEvent) => {
            if (this.remoteStreams[targetUserId] == null) {
                this.remoteStreams[targetUserId] = new MediaStream();
                console.warn('Удалённый поток добавлен для пользователя:', targetUserId);
                const audioElement = document.createElement('audio');
                audioElement.srcObject = this.remoteStreams[targetUserId];
                audioElement.autoplay = true;
                document.body.appendChild(audioElement);
            }
            this.remoteStreams[targetUserId].addTrack(trackEvent.track);
        };

        // Add local tracks to the PeerConnection
        if (this.localStream != null) {
            this.localStream.getTracks().forEach((audioTrack) => {
                if (this.localStream != null) {
                    peerConnection.addTrack(audioTrack, this.localStream);
                }
            });
        }

        this.peerConnections[targetUserId] = peerConnection; // Save PeerConnection for the user
        this.state = SocketClientState.PEER_CONNECTION_ESTABLISHED;
        return peerConnection;
    }

    private async createOffer(targetUserId: string) {
        const peerConnection = this.createPeerConnection(targetUserId);
        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            this.socket?.emit('signal', {
                to: targetUserId,
                type: 'offer',
                sdp: offer.sdp
            });
        } catch {
            // Ошибка при создании предложения
        }
    }

    private async createAnswer(targetUserId: string) {
        const peerConnection = this.peerConnections[targetUserId];
        try {
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            this.socket?.emit('signal', {
                to: targetUserId,
                type: 'answer',
                sdp: answer.sdp
            });
        } catch {
            // Ошибка при создании ответа
        }
    }

    private async handleSignal(data: { from: string; type: string; sdp?: string; candidate?: RTCIceCandidateInit }) {
        const { from, type, sdp, candidate } = data;

        if (this.peerConnections[from] == null) {
            this.createPeerConnection(from); // Create PeerConnection if it doesn't exist
        }

        if (type === 'offer') {
            await this.peerConnections[from].setRemoteDescription(new RTCSessionDescription({ type, sdp }));
            await this.createAnswer(from); // Reply to the user who sent the offer
        } else if (type === 'answer') {
            await this.peerConnections[from].setRemoteDescription(new RTCSessionDescription({ type, sdp }));
        } else if (type === 'candidate') {
            await this.peerConnections[from].addIceCandidate(new RTCIceCandidate(candidate));
        }
    }

    private disconnectPeer(socketId: string) {
        const peerConnection = this.peerConnections[socketId];
        if (peerConnection != null) {
            peerConnection.close(); // Close the connection
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- Необходимо удалить динамическое свойство
            delete this.peerConnections[socketId]; // Remove from storage
        }
        const remoteStream = this.remoteStreams[socketId];
        if (remoteStream != null) {
            remoteStream.getTracks().forEach((audioTrack) => {
                audioTrack.stop();
            });
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- Необходимо удалить динамическое свойство
            delete this.remoteStreams[socketId]; // Remove remote stream
        }
    }

    public disconnect() {
        if (this.socket != null) {
            this.socket.disconnect();
        }
        Object.values(this.peerConnections).forEach((peerConnection) => {
            peerConnection.close();
        });
        this.peerConnections = {};
        if (this.localStream != null) {
            this.localStream.getTracks().forEach((audioTrack) => {
                audioTrack.stop();
            });
            this.localStream = null;
        }
        Object.values(this.remoteStreams).forEach((stream) => {
            stream.getTracks().forEach((audioTrack) => {
                audioTrack.stop();
            });
        });
        this.state = SocketClientState.PEER_CONNECTION_CLOSED;
        this.remoteStreams = {};
    }
}

export default SocketClient;
