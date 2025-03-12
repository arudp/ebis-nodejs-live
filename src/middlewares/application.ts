import { Request, Response, NextFunction } from "express";

export function logRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { method, url, headers, body } = req;
  let requestText = `${method} ${url} HTTP/${req.httpVersion}\n`;

  for (const [key, value] of Object.entries(headers)) {
    requestText += `${key}: ${value}\n`;
  }

  requestText += `${JSON.stringify(body, null, 2)}\n`;
  console.log(requestText);

  next();
}
