/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// export default {
// 	async fetch(request, env, ctx): Promise<Response> {
// 		return new Response('Hello World!');
// 	},
// } satisfies ExportedHandler<Env>;
import { env } from "cloudflare:workers";
import { httpServerHandler } from "cloudflare:node";
import express from "express";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/api/data', async (req, res) => {
	try {
		const { results } = await env.DB.prepare('SELECT * FROM my_data').all();

		res.json({ success: true, data: results });
	} catch (error) {
		res.status(500).json({ success: false, error: 'Failed to fetch members' });
	}
});

app.put("/api/data", async (req, res) => {
	try {
		const { data } = req.body;
		const result = await env.DB.prepare(
			`UPDATE my_data SET data='${data}'`
		).run();

		if (result.meta.changes === 0) {
			return res
				.status(404)
				.json({ success: false, error: "couldn't update" });
		}

		res.json({ success: true, message: "data updated successfully" });
	} catch (error: any) {
		// if (error.message?.includes("UNIQUE constraint failed")) {
		// 	return res.status(409).json({
		// 		success: false,
		// 		error: "Email already exists",
		// 	});
		// }
		res.status(500).json({ success: false, error: "Failed to update data" });
	}
});

app.listen(3000);
export default httpServerHandler({ port: 3000 });