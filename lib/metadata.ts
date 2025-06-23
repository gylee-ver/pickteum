export const SITE_URL = 'https://www.pickteum.com'

export const canonical = (pathname: string) => ({
  alternates: { canonical: `${SITE_URL}${pathname}` },
}) 