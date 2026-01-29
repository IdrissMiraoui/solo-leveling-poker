import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export const translations = {
    en: {
        system_access: 'SYSTEM ACCESS',
        player_name: 'PLAYER NAME',
        name_placeholder: 'Enter your name...',
        room_id: 'ROOM ID',
        generate_new: 'GENERATE NEW',
        room_placeholder: 'Enter Room ID...',
        avatar_class: 'AVATAR CLASS',
        enter_dungeon: 'ENTER DUNGEON',
        system_alert_missing: 'SYSTEM ALERT: NAME AND ROOM ID REQUIRED',
        system_online: 'SYSTEM ONLINE',
        disconnected: 'DISCONNECTED',
        room: 'ROOM',
        leave_room: 'Leave Room',
        status: 'STATUS',
        online: 'ONLINE',
        offline: 'OFFLINE',
        pid: 'PID',
        players: 'PLAYERS',
        you: 'YOU',
        system_avg: 'SYSTEM_AVE',
        reveal: 'REVEAL',
        reset: 'RESET',
        revote: 'REVOTE',
        dungeon_cleared: 'DUNGEON CLEARED',
        unanimity_achieved: 'SYSTEM REWARD: UNANIMITY ACHIEVED',
        copied: 'COPIED',
        punishment_message: '"Your estimation offends the System. Explain..."'
    },
    fr: {
        system_access: 'ACCÈS SYSTÈME',
        player_name: 'NOM DU JOUEUR',
        name_placeholder: 'Entrez votre nom...',
        room_id: 'ID DE SALLE',
        generate_new: 'GÉNÉRER NOUVEAU',
        room_placeholder: "Entrez l'ID de salle...",
        avatar_class: "CLASSE D'AVATAR",
        enter_dungeon: 'ENTRER DANS LE DONJON',
        system_alert_missing: 'ALERTE SYSTÈME : NOM ET ID REQUIS',
        system_online: 'SYSTÈME EN LIGNE',
        disconnected: 'DÉCONNECTÉ',
        room: 'SALLE',
        leave_room: 'Quitter la salle',
        status: 'STATUT',
        online: 'EN LIGNE',
        offline: 'HORS LIGNE',
        pid: 'PID',
        players: 'JOUEURS',
        you: 'VOUS',
        system_avg: 'MOY_SYS',
        reveal: 'RÉVÉLER',
        reset: 'RÉINITIALISER',
        revote: 'REVOTER',
        dungeon_cleared: 'DONJON NETTOYÉ',
        unanimity_achieved: 'RÉCOMPENSE SYSTÈME : UNANIMITÉ ATTEINTE',
        copied: 'COPIÉ',
        punishment_message: '"Votre estimation offense le Système. Explique..."'
    },
    es: {
        system_access: 'ACCESO AL SISTEMA',
        player_name: 'NOMBRE DEL JUGADOR',
        name_placeholder: 'Introduce tu nombre...',
        room_id: 'ID DE SALA',
        generate_new: 'GENERAR NUEVO',
        room_placeholder: 'Introduce ID de sala...',
        avatar_class: 'CLASE DE AVATAR',
        enter_dungeon: 'ENTRAR A LA MAZMORRA',
        system_alert_missing: 'ALERTA DEL SISTEMA: NOMBRE E ID REQUERIDOS',
        system_online: 'SISTEMA EN LÍNEA',
        disconnected: 'DESCONECTADO',
        room: 'SALA',
        leave_room: 'Salir de la sala',
        status: 'ESTADO',
        online: 'EN LÍNEA',
        offline: 'DESCONECTADO',
        pid: 'PID',
        players: 'JUGADORES',
        you: 'TÚ',
        system_avg: 'PROM_SYS',
        reveal: 'REVELAR',
        reset: 'REINICIAR',
        revote: 'REVOTAR',
        dungeon_cleared: 'MAZMORRA COMPLETADA',
        unanimity_achieved: 'RECOMPENSA DEL SISTEMA: UNANIMIDAD LOGRADA',
        copied: 'COPIADO',
        punishment_message: '"Tu estimación ofende al Sistema. Explica..."'
    }
};

export type Language = 'en' | 'fr' | 'es';
type TranslationKey = keyof typeof translations['en'];

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Default to 'en' per user request, but support persistence
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('solo_lang');
        return (saved === 'en' || saved === 'fr' || saved === 'es') ? saved : 'en';
    });

    useEffect(() => {
        localStorage.setItem('solo_lang', language);
    }, [language]);

    const t = (key: TranslationKey) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
