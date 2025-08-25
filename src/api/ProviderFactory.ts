import * as vscode from 'vscode';
import { IApiProvider } from './IApiProvider';
import { DeepSeekProvider } from './deepseek';
import { OpenAiProvider } from './OpenAiProvider';
import { AddisAiProvider } from './AddisAiProvider';

export enum ApiProviderType {
    DEEPSEEK = 'deepseek',
    OPENAI = 'openai',
    ADDIS_AI = 'addis-ai'
}

export class ProviderFactory {
    static createProvider(apiKey: string, providerType: ApiProviderType): IApiProvider {
        switch (providerType) {
            case ApiProviderType.DEEPSEEK:
                return new DeepSeekProvider(apiKey);
            case ApiProviderType.OPENAI:
                return new OpenAiProvider(apiKey);
            case ApiProviderType.ADDIS_AI:
                return new AddisAiProvider(apiKey);
            default:
                throw new Error(`Unknown provider type: ${providerType}`);
        }
    }

    static validateApiKey(apiKey: string, providerType: ApiProviderType): boolean {
        switch (providerType) {
            case ApiProviderType.DEEPSEEK:
                return new DeepSeekProvider(apiKey).validateApiKey(apiKey);
            case ApiProviderType.OPENAI:
                return new OpenAiProvider(apiKey).validateApiKey(apiKey);
            case ApiProviderType.ADDIS_AI:
                return new AddisAiProvider(apiKey).validateApiKey(apiKey);
            default:
                return false;
        }
    }

    static getProviderDisplayName(providerType: ApiProviderType): string {
        switch (providerType) {
            case ApiProviderType.DEEPSEEK:
                return 'DeepSeek';
            case ApiProviderType.OPENAI:
                return 'OpenAI';
            case ApiProviderType.ADDIS_AI:
                return 'ADDIS AI';
            default:
                return 'Unknown';
        }
    }

    static getDefaultProvider(): ApiProviderType {
        const config = vscode.workspace.getConfiguration('deepseekCopilot');
        return config.get<ApiProviderType>('provider', ApiProviderType.DEEPSEEK);
    }

    static getApiKeySecretName(providerType: ApiProviderType): string {
        switch (providerType) {
            case ApiProviderType.DEEPSEEK:
                return 'deepseekApiKey';
            case ApiProviderType.OPENAI:
                return 'openaiApiKey';
            case ApiProviderType.ADDIS_AI:
                return 'addisAiApiKey';
            default:
                return 'unknownApiKey';
        }
    }
}
