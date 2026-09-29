import { Router } from "express";
import { authRouter } from "./routes/auth.js";
import { marketRouter } from "./routes/market.js";
import { greeksRouter } from "./routes/greeks.js";
import { quotesRouter } from "./routes/quotes.js";
import { optionsRouter } from "./routes/options.js";
import { portfolioRouter } from "./routes/portfolio.js";
import { ordersRouter } from "./routes/orders.js";
import { strategiesRouter } from "./routes/strategies.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/market", marketRouter);
apiRouter.use("/greeks", greeksRouter);
apiRouter.use("/quotes", quotesRouter);
apiRouter.use("/options", optionsRouter);
apiRouter.use("/portfolio", portfolioRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/strategies", strategiesRouter);
