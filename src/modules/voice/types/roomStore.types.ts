export interface UserData {
    id: number;
    username: string;
    profilePicture?: string;
    role: string;
}

export interface Participant {
    socketId: string;
    micToggle: boolean;
    userData: UserData;
    isSpeaking?: boolean;
}
