export const requiredAuth = async (ctx, next) => {
  if (!ctx.state.isSignedIn()) {
    ctx.throw(403);
  }
  await next();
};

export default requiredAuth;
