import { useSelector } from "react-redux";

export const translations = {
    ENG: {
      

      //Side Bar Translations
      flightMap: "Flight Map",
      flightdata: "Flight Data",
      connectInfo: "Connect Info .",

      

    },
   
  };
  
  // Custom hook for accessing translations
  export const useTranslations = () => {
    const selector = useSelector;
    const currentLanguage = selector((state) => state.language.currentLanguage);
    return translations[currentLanguage];
  };

  export default useTranslations;