import { makeAutoObservable, runInAction } from 'mobx';
import type { Channel } from '../types/channel';
import { channelService } from '../services/channelService';
import notificationStore from './NotificationStore';

class ChannelsStore {
    public channels: Channel[] = [];
    public currentChannel: Channel | null = null;
    public loading = false;
    public error: string | null = null;

    public constructor() {
        makeAutoObservable(this);
    }

    // Set current channel
    setCurrentChannel(channel: Channel | null): void {
        this.currentChannel = channel;
    }
    // Fetch channels for the current server
    async fetchChannels(serverId: number): Promise<void> {
        runInAction(() => {
            this.loading = true;
            this.error = null;
        });

        try {
            const data = (await channelService.getByServer(serverId)) as Channel[];
            runInAction(() => {
                this.channels = data;
                this.loading = false;
            });
        } catch (error) {
            runInAction(() => {
                this.error = (error as Error).message;
                this.loading = false;
            });
        }
    }

    // Create a new channel in the current server
    async createChannel(serverId: number, channelData: Omit<Channel, 'id'>): Promise<void> {
        runInAction(() => {
            this.error = null;
        });

        try {
            const newChannel = (await channelService.create(serverId, channelData)) as Channel;
            runInAction(() => {
                this.channels.push(newChannel);
            });
            notificationStore.addNotification('notifications.channelCreateSuccess', 'info');
        } catch (error) {
            runInAction(() => {
                this.error = (error as Error).message;
            });
            notificationStore.addNotification('notifications.channelCreateError', 'error');
        }
    }

    // Delete a channel from the current server
    async deleteChannel(channelId: number, serverId: number): Promise<void> {
        runInAction(() => {
            this.error = null;
        });

        try {
            await channelService.delete(serverId, channelId);
            runInAction(() => {
                this.channels = this.channels.filter((channel) => channel.id !== channelId);
            });
        } catch (error) {
            runInAction(() => {
                this.error = (error as Error).message;
            });
        }
    }
}
const channelsStore = new ChannelsStore();
export default channelsStore;
