import { useEffect, useState } from "react";
import useProductStore from "../store/useProductStore";
import ProductCard from "../components/ProductCard";

const PeopleAlsoBought = () => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const { getRecommendedProducts } = useProductStore();
  useEffect(() => {
    (async () => {
      const products = await getRecommendedProducts();
      setRecommendedProducts(products);
    })();
  }, [getRecommendedProducts]);
  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold text-emerald-400">
        People also bought
      </h3>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg: grid-col-3">
        {recommendedProducts?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default PeopleAlsoBought;
