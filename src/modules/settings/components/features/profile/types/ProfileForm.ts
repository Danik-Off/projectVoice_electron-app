export interface ProfileForm {
    username: string;
    email: string; // Только для отображения (бэкенд не позволяет менять email)
    profilePicture?: string;
    bio?: string;
}
