import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';

import { LOCAL_IMAGES } from '../../core/config/product.config';
import { Product } from './product.model';

/** DummyJSON API — через proxy в dev/prod */
const API_BASE = '/api/products';

/** DummyJSON возвращает цены в USD; множитель для ₽ */
const USD_TO_RUB = 95;

interface DummyJsonProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  thumbnail: string;
  images: string[];
}

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private cachedProducts$: Observable<{ products: Product[]; total: number }> | null = null;

  getProducts(limit = 24, skip = 0): Observable<{ products: Product[]; total: number }> {
    if (limit === 24 && skip === 0 && this.cachedProducts$) {
      return this.cachedProducts$;
    }

    const stream$ = this.http
      .get<{
        products: DummyJsonProduct[];
        total: number;
      }>(`${API_BASE}?limit=${limit}&skip=${skip}`)
      .pipe(
        map((res) => ({
          products: res.products.map((p) => this.mapToProduct(p)),
          total: res.total,
        })),
        shareReplay(1)
      );
    if (limit === 24 && skip === 0) {
      this.cachedProducts$ = stream$;
    }
    return stream$;
  }

  searchProducts(query: string): Observable<{ products: Product[]; total: number }> {
    const q = query.trim();
    const url = q ? `${API_BASE}/search?q=${encodeURIComponent(q)}` : `${API_BASE}?limit=100`;
    return this.http.get<{ products: DummyJsonProduct[]; total: number }>(url).pipe(
      map((res) => ({
        products: res.products.map((p) => this.mapToProduct(p)),
        total: res.total,
      }))
    );
  }

  /** URL картинки: локальные файлы из public/img по индексу продукта (fallback для CORS) */
  private toLocalImageUrl(productId: number): string {
    const filename = LOCAL_IMAGES[(productId - 1) % LOCAL_IMAGES.length];
    return `/img/${encodeURIComponent(filename)}`;
  }

  private mapToProduct(raw: DummyJsonProduct): Product {
    const priceRub = Math.round(raw.price * USD_TO_RUB);
    const imageUrl = this.toLocalImageUrl(raw.id);
    return {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      category: raw.category,
      price: priceRub,
      discountPercentage: raw.discountPercentage ?? 0,
      rating: raw.rating,
      stock: raw.stock,
      brand: raw.brand ?? '',
      thumbnail: imageUrl,
      images: [imageUrl],
    };
  }
}
