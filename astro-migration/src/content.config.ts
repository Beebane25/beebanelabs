// src/content.config.ts — Astro v7 content collections
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    category: z.string(),
    difficulty: z.enum(['pemula', 'menengah', 'lanjutan']).default('pemula'),
    readingTime: z.string().optional(),
    access: z.enum(['Gratis', 'Token']).default('Gratis'),
    date: z.string().optional(),
    icon: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { articles };
