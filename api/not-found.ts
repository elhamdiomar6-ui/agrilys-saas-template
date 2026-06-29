type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
};

export default function handler(_req: unknown, res: VercelResponse) {
  res.status(404);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send('Document deplace - contactez le bureau.');
}
