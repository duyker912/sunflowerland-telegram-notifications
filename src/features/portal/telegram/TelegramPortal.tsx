import React, { useContext, useEffect, useState } from "react";
import { useActor, useSelector } from "@xstate/react";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";

import { PortalContext } from "../example/lib/PortalProvider";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { authorisePortal } from "../lib/portalUtil";
import { PortalMachineState } from "../example/lib/portalMachine";
import { Loading } from "features/auth/components";
import { CONFIG } from "lib/config";

import { TelegramDashboard } from "./components/TelegramDashboard";
import { TelegramSettings } from "./components/TelegramSettings";
import { TelegramNotifications } from "./components/TelegramNotifications";

const _gameState = (state: PortalMachineState) => state.context.state;

/**
 * Telegram Portal - Quản lý thông báo Telegram cho Sunflower Land
 */
export const TelegramPortal: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);
  const { t } = useAppTranslation();
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings' | 'notifications'>('dashboard');

  const gameState = useSelector(portalService, _gameState);

  // API base URL cho backend
  const API_BASE_URL = process.env.VITE_API_URL || 'https://sunflowerland-telegram-notifications-production.up.railway.app/api';

  if (portalState.matches("error")) {
    return (
      <Modal show>
        <Panel>
          <div className="p-2">
            <Label type="danger">{t("error")}</Label>
            <span className="text-sm my-2">{t("error.wentWrong")}</span>
          </div>
          <Button onClick={() => portalService.send("RETRY")}>
            {t("retry")}
          </Button>
        </Panel>
      </Modal>
    );
  }

  if (portalState.matches("unauthorised")) {
    return (
      <Modal show>
        <Panel>
          <div className="p-2">
            <Label type="danger">{t("error")}</Label>
            <span className="text-sm my-2">{t("session.expired")}</span>
          </div>
          <Button onClick={authorisePortal}>{t("welcome.login")}</Button>
        </Panel>
      </Modal>
    );
  }

  if (portalState.matches("loading")) {
    return (
      <Modal show>
        <Panel>
          <Loading />
          <span className="text-xs">
            {`${t("last.updated")}:${CONFIG.CLIENT_VERSION}`}
          </span>
        </Panel>
      </Modal>
    );
  }

  return (
    <div className="telegram-portal">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">🌻</span>
            </div>
            <h1 className="text-xl font-bold">Sunflower Land Telegram Portal</h1>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => setCurrentView('dashboard')}
              className={currentView === 'dashboard' ? 'bg-white text-green-600' : 'bg-green-500 text-white'}
            >
              Dashboard
            </Button>
            <Button 
              onClick={() => setCurrentView('notifications')}
              className={currentView === 'notifications' ? 'bg-white text-green-600' : 'bg-green-500 text-white'}
            >
              Thông báo
            </Button>
            <Button 
              onClick={() => setCurrentView('settings')}
              className={currentView === 'settings' ? 'bg-white text-green-600' : 'bg-green-500 text-white'}
            >
              Cài đặt
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 p-4">
        {currentView === 'dashboard' && (
          <TelegramDashboard 
            gameState={gameState} 
            apiUrl={API_BASE_URL}
          />
        )}
        {currentView === 'notifications' && (
          <TelegramNotifications 
            gameState={gameState} 
            apiUrl={API_BASE_URL}
          />
        )}
        {currentView === 'settings' && (
          <TelegramSettings 
            gameState={gameState} 
            apiUrl={API_BASE_URL}
          />
        )}
      </div>
    </div>
  );
};
