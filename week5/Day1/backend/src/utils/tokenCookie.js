const cookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
};

export const setTokenCookie = (res, token) => {
    res.cookie("token", token, cookieOptions());
};

export const clearTokenCookie = (res) => {
    res.clearCookie("token", cookieOptions());
}