interface Person {
    id: string;
    firstName: string;
}

interface Event {
    id: number;
}

export interface User extends Person {
    email: string;
    role: string;
    reminders: any;
    infants: Infant[];
    crud?: boolean; // Indicates if the user has CRUD permissions
    notifyAdmin?: boolean; // Indicates if the user wants to notify the admin on changes
}

export interface InfantUser {
    userName: string; // The name of the user who has access to this infant's profile
    infantId: string; // The ID of the infant this user is associated with
    userId: string; // The ID of the user who has access to this infant's profile
    crud: boolean; // true for Guardian, false for Babysitter
    notifyAdmin: boolean; // true if the user wants to notify the admin on changes
}

export interface Infant extends Person {
    parentId: string;
    users: InfantUser[]; // Users who have access to this infant's profile
    userIsAdmin?: boolean; // Indicates if the user is an admin for this infant
    publicId?: string; // Cloudinary public ID for the infant's photo
    dob: string; // Date of birth in ISO format
    gender: string
}

export interface Diaper extends Event {
    type: 'dry' | 'wet' | 'soiled' | 'mixed';
    size: 'light' | 'medium' | 'heavy';
    changed_at: number; // Timestamp in seconds
}

export interface Feed extends Event {
    method: 'bottle' | 'nursing';
    amount?: number; // in milliliters or grams
    duration?: number; // in minutes
    fed_at: number; // Timestamp in seconds
}
