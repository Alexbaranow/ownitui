import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';

import { LOCAL_IMAGES } from '../../core/config/product.config';
import { Product } from './product.model';

/** Fake Store API — через proxy (proxy.conf.json) в dev, чтобы избежать CORS и таймаутов */
const API_BASE = '/api/fakestore/products';

/** Fake Store возвращает цены в USD; множитель для ₽ */
const USD_TO_RUB = 95;

interface FakeStoreProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;

  image: string;
  rating: { rate: number; count: number };
}

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private cachedProducts$: Observable<{ products: Product[]; total: number }> | null = null;

  getProducts(limit = 24, skip = 0): Observable<{ products: Product[]; total: number }> {
    if (limit === 24 && skip === 0 && this.cachedProducts$) {
      return this.cachedProducts$;
    }

    const stream$ = this.http.get<FakeStoreProduct[]>(API_BASE).pipe(
      map((arr) => ({
        products: arr.slice(skip, skip + limit).map((p) => this.mapToProduct(p)),
        total: arr.length,
      })),
      shareReplay(1)
    );
    if (limit === 24 && skip === 0) {
      this.cachedProducts$ = stream$;
    }
    return stream$;
  }

  searchProducts(query: string): Observable<{ products: Product[]; total: number }> {
    const q = query.toLowerCase().trim();
    return this.http.get<FakeStoreProduct[]>(API_BASE).pipe(
      map((arr) => {
        const filtered = q
          ? arr.filter(
              (p) =>
                p.title.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q)
            )
          : arr;
        const products = filtered.map((p) => this.mapToProduct(p));
        return { products, total: products.length };
      })
    );
  }

  /** URL картинки: локальные файлы из public/img по индексу продукта */
  private toLocalImageUrl(productId: number): string {
    const filename = LOCAL_IMAGES[(productId - 1) % LOCAL_IMAGES.length];
    return `/img/${encodeURIComponent(filename)}`;
  }

  private mapToProduct(raw: FakeStoreProduct): Product {
    const priceRub = Math.round(raw.price * USD_TO_RUB);
    const imageUrl = this.toLocalImageUrl(raw.id);
    return {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      category: raw.category,
      price: priceRub,
      discountPercentage: 0,
      rating: raw.rating.rate,
      stock: raw.rating.count,
      brand: '',
      thumbnail: imageUrl,
      images: [imageUrl],
    };
  }
}
