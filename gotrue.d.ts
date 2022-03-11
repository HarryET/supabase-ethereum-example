declare module "@gotrue/types" {
    export type Status = "CONNECTED" | "AUTHENTICATED" | "UNKNOWN";

    export interface NonceResponse {
        id: string;
        nonce: string;
    }

    export interface EthResponse {
        access_token: string;
        token_type: string;
        expires_in: number;
        refresh_token: string;
        user: User;
    }

    export interface User {
        id: string;
        aud: string;
        role: string;
        email: string;
        phone: string;
        last_sign_in_at: string;
        app_metadata: {
        provider: string;
        providers: string[];
        };
        user_metadata: Record<string, any>;
        identities: any[];
        created_at: string;
        updated_at: string;
    }
}
