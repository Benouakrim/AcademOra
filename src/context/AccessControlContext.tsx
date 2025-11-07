import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ModalCode = 'LOGIN_REQUIRED' | 'UPGRADE_REQUIRED' | 'UNKNOWN' | '';

type ModalContent = {
  title: string;
  message: string;
  code: ModalCode;
};

type AccessControlContextType = {
  showUpgradeModal: (content: { message: string; code: string }) => void;
};

const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

export const AccessControlProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>({ title: '', message: '', code: '' });

  const showUpgradeModal = ({ message, code }: { message?: string; code?: string }) => {
    let title = 'Access Denied';
    let safeCode: ModalCode = 'UNKNOWN';

    if (code === 'LOGIN_REQUIRED') {
      title = 'Login Required';
      safeCode = 'LOGIN_REQUIRED';
    } else if (code === 'UPGRADE_REQUIRED') {
      title = 'Upgrade Required';
      safeCode = 'UPGRADE_REQUIRED';
    }

    const fallbackMessage =
      safeCode === 'LOGIN_REQUIRED'
        ? 'Please register for a free account to continue.'
        : safeCode === 'UPGRADE_REQUIRED'
          ? 'You have reached the limit for this feature. Upgrade to unlock more uses.'
          : 'You do not have access to this feature.';

    setModalContent({
      title,
      message: message || fallbackMessage,
      code: safeCode,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <AccessControlContext.Provider value={{ showUpgradeModal }}>
      {children}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">{modalContent.title}</h2>
            <p className="text-gray-700 mb-6">{modalContent.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
              {modalContent.code === 'LOGIN_REQUIRED' && (
                <Link
                  to="/login"
                  onClick={closeModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Login
                </Link>
              )}
              {modalContent.code === 'UPGRADE_REQUIRED' && (
                <Link
                  to="/pricing"
                  onClick={closeModal}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </AccessControlContext.Provider>
  );
};

export const useAccessControl = () => {
  const context = useContext(AccessControlContext);
  if (!context) {
    throw new Error('useAccessControl must be used within an AccessControlProvider');
  }
  return context;
};

