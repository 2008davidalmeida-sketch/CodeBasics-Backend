import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// validate the request from the body, query, and params using Zod
export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.issues.map((issue) => ({
                        path: issue.path.join('.'),
                        message: issue.message,
                    })),
                });
            }
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };
};
