import { readdir, writeFile } from 'node:fs/promises';

const mimeType = (extension) => {
    switch (extension) {
        case 'js': return 'application/javascript';
        case 'css': return 'text/css';
        case 'wasm': return 'application/wasm';
        case 'png': return 'image/png';
        case 'ico': return 'image/x-icon';
        case 'html': return 'text/html';
        default: throw new Error('Unrecognised file extension: ${extension}');
    }
}

const hqDistDir = await readdir('./pages', { encoding: 'utf8', recursive: true });
const fileNames = hqDistDir.filter((name) => !['assets', 'index.html'].includes(name));
const pathMatches = fileNames.map((name) => `"/${name}"`)

const pathMatcher = `match req.get_path() {
    ${pathMatches.join(' | ')} => req.with_set_header("Host", "hyperquark.github.io").send(BACKEND)?,
    path @ _ => {
        let ok_path_re = Regex::new(r"^/(settings|about|projects/(file|test|\d+))?$").unwrap();
        if ok_path_re.is_match(path) {
            Request::get("https://hyperquark.github.io/").send(BACKEND)?
        } else {
            Request::get("https://hyperquark.github.io/").send(BACKEND)?.with_status(404)
        }
    }
}`;

console.log(pathMatcher)

await writeFile('path-matcher.rs', pathMatcher, { encoding: 'utf8' });