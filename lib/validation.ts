import { z } from 'zod';

export const flashcardSchema = z.object({
  text: z.string().max(10000).optional(),
  images: z.array(z.object({
    mimeType: z.string(),
    data: z.string(),
  })).optional(),
  userId: z.string().optional(),
});

export const analyzeSchema = z.object({
  role: z.string().min(2).max(100),
  skills: z.string().max(10000).optional(),
  images: z.array(z.object({
    mimeType: z.string(),
    data: z.string(),
  })).optional(),
  userId: z.string().optional(),
});

export const generateSchema = z.object({
  syllabus: z.string().min(10).max(10000),
  days: z.union([z.string(), z.number()]).transform(String),
  targetDays: z.union([z.string(), z.number()]).transform(String).optional(),
  images: z.array(z.object({
    mimeType: z.string(),
    data: z.string(),
  })).optional(),
  userId: z.string().optional(),
});

export const supportSchema = z.object({
  email: z.string().email(),
  subject: z.string().min(3).max(200).optional(),
  message: z.string().min(10).max(5000),
});

export const feedbackSchema = z.object({
  userId: z.string().optional(),
  rating: z.number().min(1).max(5),
  message: z.string().max(2000).optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

export const refundSchema = z.object({
  user_id: z.string().optional(),
  user_email: z.string().email(),
  order_id: z.string().optional(),
  amount: z.number().optional(),
  reason: z.string().min(5).max(2000),
});
