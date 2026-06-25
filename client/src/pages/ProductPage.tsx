import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";
import { dummyProducts } from "../assets/assets";
import Loading from "../components/Loading";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import {
  ArrowLeftIcon,
  HomeIcon,
  LeafIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  StarIcon,
} from "lucide-react";
import DummyReviewsSection from "../assets/DummyReviewsSection";
import ProductCard from "../components/ProductCard";

const ProductPage = () => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [localQuantity, setLocalQuantity] = useState(1);

  useEffect(() => {
    setLoading(true);
    setLocalQuantity(1);

    window.scrollTo(0, 0);

    const currentProduct = dummyProducts.find((p) => p._id === id);

    if (!currentProduct) {
      setProduct(null);
      setRelatedProduct([]);
      setLoading(false);
      return;
    }

    setProduct(currentProduct);

    const related = dummyProducts
      .filter(
        (p) =>
          p._id !== currentProduct._id &&
          p.category === currentProduct.category,
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0,8);

    setRelatedProduct(related);

    setLoading(false);
  }, [id]);

  if (loading) return <Loading />;
  if (!product) return null;
  const cartItem = items.find((item) => item.product._id === product._id);
  const inCart = !!cartItem;
  const displayQuantity = inCart ? cartItem.quantity : localQuantity;

  const handleMinus = () => {
    if (inCart) {
      if (cartItem.quantity > 1)
        updateQuantity(product._id, cartItem.quantity - 1);
      else removeFromCart(product._id);
    } else {
      setLocalQuantity(Math.max(1, localQuantity - 1));
    }
  };

  const handlePlus = () => {
    if (inCart) {
      updateQuantity(product._id, cartItem.quantity + 1);
    } else {
      setLocalQuantity(localQuantity + 1);
    }
  };

  const categoryLabel = product.category.replace(/-/g, " ");
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
          <Link to="/" className="hover:text-app-green transition-colors">
            <HomeIcon className="size-4" />
          </Link>
          <span>/</span>
          <Link
            to="/products"
            className="hover:text-app-green transition-colors"
          >
            Products
          </Link>
          <span>/</span>
          <Link
            to={`/products?category=${product.category}`}
            className="hover:text-app-green transition-colors capitalize"
          >
            {categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-app-green font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-sm text-app-text-light hover:text-app-green"
        >
          <ArrowLeftIcon className="size-4" /> Back
        </button>

        {/*Product detail section*/}
        <div className="bg-white rounded-2xl overflow-hidden ">
          <div className="grid md:grid-cols-2 gap-2">
            {/* IMAGE */}
            <div className="relative flex items-center justify-center p-8 md:p-12 min-h-[320px] md:min-h-[500px] bg-app-cream">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-[380px] w-auto object-contain"
              />

              <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                {product.isOrganic && (
                  <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-app-green text-white rounded-full">
                    <LeafIcon className="w-3 h-3" />
                    Organic
                  </span>
                )}

                {product.discount > 0 && (
                  <span className="px-2.5 py-1 text-xs font-semibold bg-app-orange text-white rounded-full">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* PRODUCT INFO */}
            <div className="p-6 md:p-10 flex flex-col justify-center">
              <span className="text-xs font-medium text-app-text-light tracking-wider mb-2 capitalize">
                {categoryLabel}
              </span>

              <h1 className="text-2xl md:text-4xl font-semibold text-app-green mb-3">
                {product.name}
              </h1>

              {product.rating > 0 && (
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(product.rating)
                            ? "text-app-warning fill-app-warning"
                            : "text-app-border"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-sm font-medium">{product.rating}</span>

                  <span className="text-sm text-app-text-light">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-3xl md:text-4xl font-bold text-app-green">
                  {currency}
                  {product.price.toFixed(2)}
                </span>

                {product.originalPrice > product.price && (
                  <span className="text-lg text-app-text-light line-through">
                    {currency}
                    {product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-sm text-app-text-light leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="mb-6">
                {product.stock > 0 ? (
                  <span className="text-sm text-app-success font-medium">
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-sm text-app-error font-medium">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Quantity + Cart */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center border border-app-border rounded-xl overflow-hidden shrink-0">
                  <button
                    onClick={handleMinus}
                    className="p-3 hover:bg-app-cream transition-colors"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>

                  <span className="px-5 text-sm font-semibold min-w-[50px] text-center">
                    {displayQuantity}
                  </span>

                  <button
                    onClick={handlePlus}
                    className="p-3 hover:bg-app-cream transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (!inCart) addToCart(product, localQuantity);
                  }}
                  disabled={product.stock === 0}
                  className={`flex-1 min-h-[48px] px-6 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2
          ${
            inCart
              ? "bg-app-cream text-app-green border border-app-green"
              : "bg-app-orange text-white hover:bg-app-orange-dark"
          }`}
                >
                  <ShoppingCartIcon className="w-4 h-4" />
                  {inCart ? "Added to Cart" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/*review*/}

        {product.reviewCount > 0 && <DummyReviewsSection product={product} />}

        {/*Product related section*/}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Related Products</h2>

                <p className="text-app-text-light">More from {categoryLabel}</p>
              </div>

              <Link
                to={`/products?category=${product.category}`}
                className="text-sm font-semibold text-app-orange hover:text-app-orange-dark flex items-center gap-1"
              >
                View All
              </Link>
            </div>

            <Swiper
              modules={[Navigation]}
              navigation
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                768: {
                  slidesPerView: 3,
                },
                1024: {
                  slidesPerView: 4,
                },
              }}
            >
              {relatedProducts.map((rp) => (
                <SwiperSlide key={rp._id}>
                  <ProductCard product={rp} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
