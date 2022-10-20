import { languageKeys } from "./keys";

export default {
  data() {
    return {
      languageKeys,
    };
  },

  methods: {
    getLanguage(languageKeys: any, locale: string) {
      if (locale.startsWith("de")) locale = "de-DE";
      if (locale.startsWith("en")) locale = "en-US";
      if (locale.startsWith("it")) locale = "it-IT";
      if (locale.startsWith("sv")) locale = "sv-SE";
      if (locale.startsWith("zh")) locale = "zh-CN";
      if (locale.includes("BR")) locale = "pt-BR";

      return languageKeys[locale]
        ? languageKeys[locale]
        : languageKeys["en-US"] || "";
    },
  },
};
