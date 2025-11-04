"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Person {
  id: string;
  name: string;
  email?: string;
  loginCode: string;
  _count: { wishlistItems: number };
}

interface Assignment {
  id: string;
  giver: { name: string };
  receiver: { name: string; wishlistItems: Array<{ title: string; link: string }> };
}

export default function AdminDashboard() {
  const [people, setPeople] = useState<Person[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonEmail, setNewPersonEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [groupInfo, setGroupInfo] = useState({ id: "", name: "", inviteCode: "" });
  const router = useRouter();

  useEffect(() => {
    // Check admin authentication and group
    const adminAuth = sessionStorage.getItem("adminAuth");
    const groupId = sessionStorage.getItem("groupId");
    const groupName = sessionStorage.getItem("groupName");
    const inviteCode = sessionStorage.getItem("inviteCode");

    if (!adminAuth || !groupId) {
      router.push("/admin");
      return;
    }

    setGroupInfo({ id: groupId, name: groupName || "", inviteCode: inviteCode || "" });
    loadData(groupId);
  }, [router]);

  const loadData = async (groupId: string) => {
    try {
      const [peopleRes, assignmentsRes] = await Promise.all([
        fetch(`/api/people?groupId=${groupId}`),
        fetch(`/api/assignments?groupId=${groupId}`),
      ]);

      const peopleData = await peopleRes.json();
      const assignmentsData = await assignmentsRes.json();

      setPeople(peopleData.people || []);
      setAssignments(assignmentsData.assignments || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load data");
      setLoading(false);
    }
  };

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!newPersonName.trim()) {
      setError("Name is required");
      return;
    }

    try {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPersonName,
          email: newPersonEmail.trim() || undefined,
          groupId: groupInfo.id
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add person");
        return;
      }

      const emailMsg = data.person.email ? ` and email: ${data.person.email}` : "";
      setSuccessMessage(`Added ${data.person.name} with code: ${data.person.loginCode}${emailMsg}`);
      setNewPersonName("");
      setNewPersonEmail("");
      loadData(groupInfo.id);
    } catch (err) {
      setError("An error occurred");
    }
  };

  const handleDeletePerson = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch(`/api/people/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setError("Failed to delete person");
        return;
      }

      setSuccessMessage(`Deleted ${name}`);
      loadData(groupInfo.id);
    } catch (err) {
      setError("An error occurred");
    }
  };

  const handleGenerateAssignments = async () => {
    if (
      !confirm(
        "This will generate Secret Santa assignments for everyone. Make sure all people have been added. Continue?"
      )
    ) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/assignments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: groupInfo.id, year: new Date().getFullYear() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate assignments");
        return;
      }

      setSuccessMessage(`Generated ${data.count} Secret Santa assignments!`);
      loadData(groupInfo.id);
    } catch (err) {
      setError("An error occurred");
    }
  };

  const handleDeleteAssignments = async () => {
    if (!confirm("Are you sure you want to delete all assignments for this year?")) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch(`/api/assignments?groupId=${groupInfo.id}&year=${new Date().getFullYear()}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setError("Failed to delete assignments");
        return;
      }

      setSuccessMessage("Deleted all assignments");
      loadData(groupInfo.id);
    } catch (err) {
      setError("An error occurred");
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-red-600">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">{groupInfo.name}</p>
            <p className="text-sm text-gray-500">
              Invite Code: <code className="bg-gray-100 px-2 py-1 rounded font-mono text-gray-900">{groupInfo.inviteCode}</code>
            </p>
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
          {/* Add Person Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Person</h2>
            <form onSubmit={handleAddPerson} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  placeholder="Enter person's name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={newPersonEmail}
                  onChange={(e) => setNewPersonEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  placeholder="person@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If provided, they can log in via email magic link instead of using the login code
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Add Person
              </button>
            </form>
          </div>

          {/* Secret Santa Assignments */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Secret Santa</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                {people.length} people registered
                {assignments.length > 0 && ` • ${assignments.length} assignments created`}
              </p>
              {assignments.length === 0 ? (
                <button
                  onClick={handleGenerateAssignments}
                  disabled={people.length < 3}
                  className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Assignments
                </button>
              ) : (
                <button
                  onClick={handleDeleteAssignments}
                  className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition"
                >
                  Delete & Regenerate
                </button>
              )}
              {people.length < 3 && (
                <p className="text-sm text-red-600">Need at least 3 people to generate assignments</p>
              )}
            </div>
          </div>
        </div>

        {/* People List */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">People ({people.length})</h2>
          {people.length === 0 ? (
            <p className="text-gray-600">No people added yet. Add your first person above!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 text-gray-900">Login Code</th>
                    <th className="text-left py-3 px-4 text-gray-900">Wishlist Items</th>
                    <th className="text-left py-3 px-4 text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((person) => (
                    <tr key={person.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{person.name}</td>
                      <td className="py-3 px-4">
                        {person.email ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 text-sm">{person.email}</span>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                              📧 Magic Link
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">No email</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-gray-900">
                          {person.loginCode}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900">{person._count.wishlistItems} / 5</span>
                          {person._count.wishlistItems > 0 ? (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                              ✓ Saved
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                              Not saved
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeletePerson(person.id, person.name)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Assignments List */}
        {assignments.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Assignments ({assignments.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-gray-900">Giver</th>
                    <th className="text-left py-3 px-4 text-gray-900">Receiver</th>
                    <th className="text-left py-3 px-4 text-gray-900">Wishlist Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{assignment.giver.name}</td>
                      <td className="py-3 px-4 text-gray-900">{assignment.receiver.name}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {assignment.receiver.wishlistItems.length} items
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
