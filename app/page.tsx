import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50 p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-red-600 mb-4">Secret Santa</h1>
        <p className="text-xl text-gray-700 mb-2">Organize Your Gift Exchange</p>
        <p className="text-gray-600 mb-12">
          Create a group for your family or friends, share wishlists, and let us randomly assign Secret Santas!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/create"
            className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition group"
          >
            <div className="text-green-600 text-5xl mb-4">🎄</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Group</h2>
            <p className="text-gray-600">
              Start a new Secret Santa event for your family or friends
            </p>
            <div className="mt-4 text-green-600 font-semibold group-hover:underline">
              Get Started →
            </div>
          </Link>

          <Link
            href="/join"
            className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition group"
          >
            <div className="text-red-600 text-5xl mb-4">🎁</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Existing Group</h2>
            <p className="text-gray-600">
              Have an invite code? Join your family's Secret Santa group
            </p>
            <div className="mt-4 text-red-600 font-semibold group-hover:underline">
              Join Now →
            </div>
          </Link>
        </div>

        <div className="text-sm text-gray-500">
          <p className="mb-1">✨ Free to use • No account required • Simple & fun</p>
        </div>
      </div>
    </div>
  );
}
