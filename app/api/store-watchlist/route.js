import { NextResponse } from "next/server";
import { connectMongoDB } from "@/libs/connectMongoDB";
import AnimeList from "@/libs/models/animeList";

export const POST = async (request) => {
    try {
        const { animeName, animeImage, animeId, genres, year, season } = await request.json();

        if (!animeName || !animeImage || !animeId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectMongoDB();

        // Check if anime already exists
        const existingAnime = await AnimeList.findOne({ animeId });
        if (existingAnime) {
            return NextResponse.json(
                { message: "Anime already exists" },
                { status: 200 }
            );
        }

        const anime = await AnimeList.create({
            animeName,
            animeImage,
            animeId,
            genres,
            year,
            season
        });

        return NextResponse.json({
            message: "Anime added successfully",
            anime
        }, { status: 201 });
    } catch (error) {
        console.error("Error adding anime:", error);
        return NextResponse.json(
            { error: "Failed to add anime" },
            { status: 500 }
        );
    }
}