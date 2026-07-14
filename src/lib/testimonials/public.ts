export interface PublicTestimonial {
  id: string;
  serviceCategory: string;
  serviceCategoryLabel: string;
  rating: number;
  displayName: string;
  testimonialText: string;
  publishedAt: string | null;
}

interface TestimonialsQueryResult {
  data: unknown;
  error: { code?: string; message?: string } | null;
}

export interface PublicTestimonialsQuery {
  eq(column: string, value: string): PublicTestimonialsQuery;
  order(
    column: string,
    options: { ascending: boolean; nullsFirst?: boolean },
  ): PublicTestimonialsQuery;
  limit(count: number): PromiseLike<TestimonialsQueryResult>;
}

export interface PublicTestimonialsClient {
  from(table: "testimonials"): {
    select(columns: string): PublicTestimonialsQuery;
  };
}
