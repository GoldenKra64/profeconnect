const prisma = require("../../lib/prisma");

class ReviewService {
  async createReview({ rating, comment, userId }) {
    return prisma.platformReview.create({
      data: {
        rating,
        comment: comment?.trim() || null,
        userId: userId ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            institutionalEmail: true,
          },
        },
      },
    });
  }

  async getAllReviews() {
    const [reviews, aggregate] = await Promise.all([
      prisma.platformReview.findMany({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              institutionalEmail: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.platformReview.aggregate({
        _avg: { rating: true },
        _count: { id: true },
      }),
    ]);

    return {
      reviews,
      averageRating: aggregate._avg.rating ?? 0,
      totalCount: aggregate._count.id,
    };
  }
}

module.exports = new ReviewService();
