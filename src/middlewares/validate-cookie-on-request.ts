import { FastifyReply, FastifyRequest } from "fastify";

export async function validateCookieOnRequest(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    return reply.code(401).send({
      message: "Unauthorized",
    });
  }
}
