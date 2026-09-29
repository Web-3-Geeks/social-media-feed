const cookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        // Lax is enough: in production the frontend proxies /api, so the cookie is
        // first-party. Lax also blocks it on cross-site POSTs (CSRF protection).
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
};

export const setTokenCookie = (res, token) => {
    res.cookie("token", token, cookieOptions());
};

export const clearTokenCookie = (res) => {
    res.clearCookie("token", cookieOptions());
}