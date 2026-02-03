import { useEffect, useState } from "react";
import axios from "axios";
import HomeHeader from "../components/HomeHeader";

const API_URL = "https://bakereserve-api.onrender.com/api";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all', 'bakery', 'cake'
  const [loading, setLoading] = useState(true);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/products`);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter Logic
  const filteredProducts = products.filter((p) =>
    filter === "all" ? true : p.category === filter,
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <HomeHeader />

      {/* Hero Title */}
      <div className="py-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-red-500">
          BakeReserve
        </h1>
      </div>

      {/* Category Pills */}
      <div className="flex justify-center mb-10 px-4">
        <div className="bg-gray-200 p-1 rounded-full inline-flex">
          {["All products", "Breads", "Cakes"].map((label) => {
            // Map labels to backend categories
            let value = "all";
            if (label === "Breads") value = "bakery";
            if (label === "Cakes") value = "cake";

            const isActive = filter === value;
            return (
              <button
                key={label}
                onClick={() => setFilter(value)}
                className={`
                  px-6 py-2 rounded-full text-sm font-semibold transition-all
                  ${isActive ? "bg-white shadow-sm text-black" : "text-gray-600 hover:text-black"}
                `}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <p className="text-center text-gray-500">Loading products...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Image Area */}
                <div className="h-48 w-full bg-gray-100 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content Area */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between mb-4">
                    <span className="text-red-500 font-bold text-lg">
                      ₱ {product.price}
                    </span>
                    <span className="text-xs text-gray-400">Available</span>
                  </div>

                  <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg text-sm transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
