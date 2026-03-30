import { COMPANY_LINKS } from "@/app/config/companyLinks"

export type AboutCompanyToken =
  | "walmart"
  | "theoriq"
  | "obvious"
  | "coinbase"
  | "voiceflow"
  | "zalando"

export type AboutActionToken = "write" | "photograph"
export type AboutCopyToken = AboutCompanyToken | AboutActionToken

export const ABOUT_COPY_TOKEN_REGEX =
  /\{(walmart|theoriq|obvious|coinbase|voiceflow|zalando|write|photograph)\}/g

export const ABOUT_COPY_TOKEN_TEXT: Record<AboutCopyToken, string> = {
  walmart: "Walmart",
  theoriq: "Theoriq",
  obvious: "Obvious",
  coinbase: "Coinbase",
  voiceflow: "Voiceflow",
  zalando: "Zalando",
  write: "write",
  photograph: "photograph",
}

export const ABOUT_COPY_COMPANY_LINKS = {
  walmart: {
    href: COMPANY_LINKS.walmart,
    label: ABOUT_COPY_TOKEN_TEXT.walmart,
    underlineStyle: "default",
  },
  theoriq: {
    href: COMPANY_LINKS.theoriq,
    label: ABOUT_COPY_TOKEN_TEXT.theoriq,
    underlineStyle: "subtle",
  },
  obvious: {
    href: COMPANY_LINKS.obvious,
    label: ABOUT_COPY_TOKEN_TEXT.obvious,
    underlineStyle: "subtle",
  },
  coinbase: {
    href: COMPANY_LINKS.coinbase,
    label: ABOUT_COPY_TOKEN_TEXT.coinbase,
    underlineStyle: "subtle",
  },
  voiceflow: {
    href: COMPANY_LINKS.voiceflow,
    label: ABOUT_COPY_TOKEN_TEXT.voiceflow,
    underlineStyle: "subtle",
  },
  zalando: {
    href: COMPANY_LINKS.zalando,
    label: ABOUT_COPY_TOKEN_TEXT.zalando,
    underlineStyle: "subtle",
  },
} as const

export function isAboutActionToken(token: AboutCopyToken): token is AboutActionToken {
  return token === "write" || token === "photograph"
}

export function stripAboutCopyTokens(text: string): string {
  return text.replace(ABOUT_COPY_TOKEN_REGEX, (_, token: AboutCopyToken) => ABOUT_COPY_TOKEN_TEXT[token])
}
