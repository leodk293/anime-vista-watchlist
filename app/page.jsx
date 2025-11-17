"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [watchList, setWatchList] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function getWatchList() {
    try {
      const res = await fetch(
        `https://anime-vista.netlify.app/api/watch-list?userId=${userId}`
      );
      if (!res.ok) {
        throw new Error(`An error has occurred`);
      }
      const result = await res.json();
      setWatchList(result.animeList);
      console.log(result.animeList);
      return result.animeList;
    } catch (error) {
      console.error(error.message);
      setWatchList([]);
      return [];
    }
  }

  async function storeFromWatchList(animeList) {
    setLoading(true);
    setMessage("");
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const anime of animeList) {
        try {
          const res = await fetch("/api/store-watchlist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              animeName: anime.animeTitle,
              animeImage: anime.animePoster,
              animeId: anime.animeId,
              genres: anime.genres,
              year: anime.year,
              season: anime.season,
            }),
          });

          const result = await res.json();

          if (res.ok) {
            successCount++;
            console.log(`Stored: ${anime.animeTitle}`);
          } else {
            errorCount++;
            console.error(`Failed to store: ${anime.animeTitle}`, result.error);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error storing ${anime.animeTitle}:`, error.message);
        }
      }

      setMessage(
        `Successfully stored ${successCount} anime. ${
          errorCount > 0 ? `Failed: ${errorCount}` : ""
        }`
      );
    } catch (error) {
      console.error(error.message);
      setMessage("An error occurred while storing anime");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!userId.trim()) {
      setMessage("Please enter a user ID");
      return;
    }

    // Get the watchlist
    const animeList = await getWatchList();

    if (animeList.length > 0) {
      // Store all anime from the watchlist
      await storeFromWatchList(animeList);
    } else {
      setMessage("No anime found in watchlist");
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="mt-20 text-center text-4xl text-white font-semibold">
        Load anime from the watch-list by providing a user id
      </h1>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-row">
        <input
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          placeholder="Enter a user id"
          className="border rounded-tl-[5px] text-xl font-semibold rounded-bl-[5px] border-gray-400 text-white px-4 py-1"
          type="text"
          disabled={loading}
        />
        <button
          className="border outline-0 rounded-tr-[5px] rounded-br-[5px] border-gray-400 bg-gray-400 cursor-pointer text-white px-4 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-white text-lg font-semibold">{message}</p>
      )}

      {watchList.length > 0 && (
        <div className="mt-8 w-full max-w-4xl">
          <h2 className="text-2xl text-white font-semibold mb-4">
            Watchlist ({watchList.length} anime)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchList.map((anime) => (
              <div
                key={anime._id}
                className="bg-gray-800 rounded-lg p-4 text-white"
              >
                <img
                  src={anime.animePoster}
                  alt={anime.animeTitle}
                  className="w-full h-48 object-cover rounded mb-2"
                />
                <h3 className="font-semibold">{anime.animeTitle}</h3>
                <p className="text-sm text-gray-400">
                  {anime.year} • {anime.season}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
