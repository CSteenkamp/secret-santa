"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface WishlistItem {
  id?: string;
  title: string;
  link: string;
}

interface Assignment {
  receiver: {
    name: string;
    wishlistItems: WishlistItem[];
  };
}

export default function Wishlist() {
  const [personId, setPersonId] = useState("");
  const [personName, setPersonName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [items, setItems] = useState<WishlistItem[]>([
    { title: "", link: "" },
  ]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const id = sessionStorage.getItem("personId");
    const name = sessionStorage.getItem("personName");
    const group = sessionStorage.getItem("groupName");
    const loginCode = sessionStorage.getItem("loginCode");

    if (!id || !name) {
      router.push("/login");
      return;
    }

    setPersonId(id);
    setPersonName(name);
    setGroupName(group || "");

    if (loginCode) {
      loadPersonData(loginCode);
    } else {
      setLoading(false);
    }
  }, [router]);

  const loadPersonData = async (loginCode: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginCode }),
      });

      if (res.ok) {
        const data = await res.json();

        // Load existing wishlist items
        if (data.person.wishlistItems && data.person.wishlistItems.length > 0) {
          setItems(data.person.wishlistItems.map((item: WishlistItem) => ({
            id: item.id,
            title: item.title,
            link: item.link,
          })));
        }

        // Load assignment
        if (data.person.assignment) {
          setAssignment(data.person.assignment);
        }
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load data");
      setLoading(false);
    }
  };

  const handleItemChange = (index: number, field: "title" | "link", value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleAddItem = () => {
    if (items.length < 5) {
      setItems([...items, { title: "", link: "" }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleSaveWishlist = async () => {
    setError("");
    setSuccessMessage("");
    setSaving(true);

    // Filter out empty items
    const validItems = items.filter((item) => item.title.trim() && item.link.trim());

    if (validItems.length < 1) {
      setError("You must add at least 1 item to your wishlist");
      setSaving(false);
      return;
    }

    if (validItems.length > 5) {
      setError("You can only have up to 5 items in your wishlist");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId,
          items: validItems,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save wishlist");
        setSaving(false);
        return;
      }

      setSuccessMessage("Wishlist saved successfully!");
      setSaving(false);

      // Reload to get updated assignment if available
      const loginCode = sessionStorage.getItem("loginCode");
      if (loginCode) {
        loadPersonData(loginCode);
      }

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("An error occurred while saving");
      setSaving(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-600">Welcome, {personName}!</h1>
            {groupName && <p className="text-gray-700 mt-1">{groupName}</p>}
            <p className="text-gray-600 mt-1 text-sm">Manage your wishlist and Secret Santa assignment</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Wishlist */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Wishlist</h2>
            <p className="text-sm text-gray-600 mb-4">Add 1-5 items you'd like to receive</p>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                    {items.length > 1 && (
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 text-sm hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleItemChange(index, "title", e.target.value)}
                      placeholder="Item name"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    />
                    <input
                      type="url"
                      value={item.link}
                      onChange={(e) => handleItemChange(index, "link", e.target.value)}
                      placeholder="https://example.com/product"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>
              ))}

              {items.length < 5 && (
                <button
                  onClick={handleAddItem}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition"
                >
                  + Add Item
                </button>
              )}

              <button
                onClick={handleSaveWishlist}
                disabled={saving}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Wishlist"}
              </button>
            </div>
          </div>

          {/* Secret Santa Assignment */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Secret Santa</h2>

            {assignment ? (
              <div>
                <p className="text-lg mb-4 text-gray-900">
                  You are Secret Santa for:{" "}
                  <span className="font-bold text-red-600">{assignment.receiver.name}</span>
                </p>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {assignment.receiver.name}'s Wishlist:
                  </h3>

                  {assignment.receiver.wishlistItems.length > 0 ? (
                    <ul className="space-y-3">
                      {assignment.receiver.wishlistItems.map((item, index) => (
                        <li key={index} className="border-b border-red-100 pb-2 last:border-0">
                          <div className="font-medium text-gray-900">{item.title}</div>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline break-all"
                          >
                            {item.link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700 italic">
                      {assignment.receiver.name} hasn't added their wishlist yet. Check back later!
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎁</div>
                <p className="text-gray-900">
                  Secret Santa assignments haven't been generated yet.
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Check back later or contact the admin!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
