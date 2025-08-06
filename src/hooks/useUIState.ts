import { useReducer, useCallback } from 'react';

export type ActiveTab = 'security' | 'notifications' | 'billing' | 'danger';

export interface UIState {
  activeTab: ActiveTab;
  showDeleteConfirm: boolean;
  showPasswordForm: boolean;
  showEmailForm: boolean;
  deletePassword: string;
}

type UIAction =
  | { type: 'SET_ACTIVE_TAB'; tab: ActiveTab }
  | { type: 'TOGGLE_DELETE_CONFIRM' }
  | { type: 'TOGGLE_PASSWORD_FORM' }
  | { type: 'TOGGLE_EMAIL_FORM' }
  | { type: 'SET_DELETE_PASSWORD'; password: string }
  | { type: 'HIDE_ALL_FORMS' }
  | { type: 'RESET_DELETE_STATE' };

const initialUIState: UIState = {
  activeTab: 'security',
  showDeleteConfirm: false,
  showPasswordForm: false,
  showEmailForm: false,
  deletePassword: '',
};

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTab: action.tab,
      };
    case 'TOGGLE_DELETE_CONFIRM':
      return {
        ...state,
        showDeleteConfirm: !state.showDeleteConfirm,
        deletePassword: state.showDeleteConfirm ? '' : state.deletePassword,
      };
    case 'TOGGLE_PASSWORD_FORM':
      return {
        ...state,
        showPasswordForm: !state.showPasswordForm,
      };
    case 'TOGGLE_EMAIL_FORM':
      return {
        ...state,
        showEmailForm: !state.showEmailForm,
      };
    case 'SET_DELETE_PASSWORD':
      return {
        ...state,
        deletePassword: action.password,
      };
    case 'HIDE_ALL_FORMS':
      return {
        ...state,
        showPasswordForm: false,
        showEmailForm: false,
      };
    case 'RESET_DELETE_STATE':
      return {
        ...state,
        showDeleteConfirm: false,
        deletePassword: '',
      };
    default:
      return state;
  }
};

export interface UseUIStateReturn {
  uiState: UIState;
  setActiveTab: (tab: ActiveTab) => void;
  toggleDeleteConfirm: () => void;
  togglePasswordForm: () => void;
  toggleEmailForm: () => void;
  setDeletePassword: (password: string) => void;
  hideAllForms: () => void;
  resetDeleteState: () => void;
}

export const useUIState = (): UseUIStateReturn => {
  const [uiState, dispatch] = useReducer(uiReducer, initialUIState);

  const setActiveTab = useCallback((tab: ActiveTab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', tab });
  }, []);

  const toggleDeleteConfirm = useCallback(() => {
    dispatch({ type: 'TOGGLE_DELETE_CONFIRM' });
  }, []);

  const togglePasswordForm = useCallback(() => {
    dispatch({ type: 'TOGGLE_PASSWORD_FORM' });
  }, []);

  const toggleEmailForm = useCallback(() => {
    dispatch({ type: 'TOGGLE_EMAIL_FORM' });
  }, []);

  const setDeletePassword = useCallback((password: string) => {
    dispatch({ type: 'SET_DELETE_PASSWORD', password });
  }, []);

  const hideAllForms = useCallback(() => {
    dispatch({ type: 'HIDE_ALL_FORMS' });
  }, []);

  const resetDeleteState = useCallback(() => {
    dispatch({ type: 'RESET_DELETE_STATE' });
  }, []);

  return {
    uiState,
    setActiveTab,
    toggleDeleteConfirm,
    togglePasswordForm,
    toggleEmailForm,
    setDeletePassword,
    hideAllForms,
    resetDeleteState,
  };
};
