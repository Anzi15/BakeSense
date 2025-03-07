import React, { useEffect, useRef, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../helpers/firebase/config"; // Adjust the import path as needed
import Barcode from "react-barcode";
import html2canvas from "html2canvas";

const BarCodePage = () => {
    const [readyProducts, setReadyProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const divRef = useRef(null);
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "readyProducts"));
                let itemsList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setReadyProducts(itemsList);
                setFilteredProducts(itemsList);
            } catch (error) {
                console.error("Error fetching raw items:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const results = readyProducts.filter((product) =>
            product.productName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(results);
    }, [searchTerm, readyProducts]);

    const handleCapture = async () => {
        if (divRef.current) {
            const canvas = await html2canvas(divRef.current, { scale: 3 });
            const dataUrl = canvas.toDataURL("image/png");
            setImageUrl(dataUrl);
        }
    };
    handleCapture()

    const handlePrint = () => {
        if (imageUrl) {
            const printWindow = window.open("", "_blank");
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print Barcode</title>
                        <style>
                            @page {
                                size: 2in 1in;
                                margin: 0;
                            }
                            body {
                                margin: 0;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                height: 100vh;
                            }
                            img {
                                width: 90%;
                                object-fit: contain;
                            }
                        </style>
                    </head>
                    <body>
                        <img src="${imageUrl}" alt="Barcode">
                        <script>
                            window.onload = function() {
                                window.print();
                                window.onafterprint = function() { window.close(); };
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <div className="flex h-screen p-4">
            {/* Left Side: Product List */}
            <div className="w-1/2 bg-gray-100 p-4 overflow-y-auto">
                <h2 className="text-lg font-bold mb-2">Ready Products</h2>
                <input
                    type="text"
                    placeholder="Search Products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 mb-2 border rounded"
                />
                {loading ? (
                    <div className="animate-pulse space-y-2">
                        <div className="h-6 bg-gray-300 rounded"></div>
                        <div className="h-6 bg-gray-300 rounded"></div>
                        <div className="h-6 bg-gray-300 rounded"></div>
                    </div>
                ) : (
                    <ul>
                        {filteredProducts.map((product) => (
                            <li
                                key={product.id}
                                className={`p-2 bg-white rounded-md transition-all duration-400 cursor-pointer border-b ${selectedProduct?.id === product.id ? "bg-blue-200" : "hover:bg-blue-50"}`}
                                onClick={() => setSelectedProduct(product)}
                            >
                                {product.productName || "Unnamed Product"}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Right Side: Barcode Preview */}
            <div className="w-1/2 flex flex-col items-center justify-center p-4 aspect-video">
                <h1 className="text-2xl font-bold mb-4">Barcode Preview</h1>
                {selectedProduct ? (
                    <>
                        <div
                            id="print-section"
                            className="text-center w-full justify-center border flex flex-col"
                            ref={divRef}
                            style={{ width: "2in", height: "1in" }}
                        >
                            <p className="font-semibold text-[10px] pb-2">{selectedProduct.productName}</p>
                            <Barcode value={selectedProduct.barCode} className="max-w-full h-[50%]" />
                            <p className="font-bold text-[9px]">Rs. {selectedProduct.pricePerUnit}</p>
                        </div>
                        {imageUrl && <img src={imageUrl} alt="Captured Div" className="mt-2" />}
                        <button onClick={handlePrint} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                            Print Barcode
                        </button>
                    </>
                ) : (
                    <p>Select a product to view its barcode</p>
                )}
            </div>
        </div>
    );
};

export default BarCodePage;
