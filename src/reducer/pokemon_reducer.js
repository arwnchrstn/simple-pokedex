export const pokemon_reducer = (state, action) => {
  switch (action.type) {
    case "SET_POKEMON_LIST":
      return { ...state, list: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_POKEMON_NAMES":
      return { ...state, names: action.payload };
    case "SET_CURRENT_API":
      return { ...state, currentApi: action.payload };
    case "SET_NEXT_API":
      return { ...state, nextApi: action.payload };
    case "SET_PREV_API":
      return { ...state, prevApi: action.payload };
    case "SET_MODAL_STATUS":
      return { ...state, modalShowAboutStatus: action.payload };
    case "SET_PWA_COMPATIBILITY":
      return { ...state, isPwaCompatible: action.payload };
    default:
      return state;
  }
};
