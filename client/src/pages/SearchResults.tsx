import React, { useEffect, useState } from "react";
import type { Product } from "../types";
import { Link, useSearchParams } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import { Home, Search } from "lucide-react";
import Loading from "../components/Loading";
import ProductCard from "../components/ProductCard";

const SearchResults = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setProducts(
      dummyProducts.filter((p: any) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      ),
    );
    setLoading(false);
  }, [query]);
  return (
    <div className="min-h-screen bg-app-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className=" flex items-center gap-2 text-sm text-app-text-lightmb-6">
          <Link to="/" className="hover:text-app-green transition-colors">
            <Home className="size-4" />
          </Link>
          <span>/</span>
          <span className="text-app-green font-medium">Search Result</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-app-green mb-1">
            Result for "{query}"
          </h1>
          <p className="text-sm text-app-text-light">
            {loading ? "Searching..." : `${products.length} items found`}
          </p>
        </div>
        {loading ? (
          <Loading />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Search className="size-16 text-app-border mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-app-green mb-2">No Result Found</h2>
            <p className="text-sm text-app-text-light mb-6 max-w-md mx-auto">
              {" "}
              We could not find any products matching {query}. Try a different
              search term.
            </p>
            <Link to="/products" className="inline-flex px-5 py-2.5 bg-app-green text-white text-sm font-medium rounded-lg">Browse All Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
