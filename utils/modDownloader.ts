import Result from './result.js';

const corsProxy = 'https://cors-header-proxy.izumiano.workers.dev';

export default class ModDownloader {
  async download(url: string): Promise<Result<Response>> {
    const modDownloadLink = await this.#getModDownloadLink(url);

    if (modDownloadLink === '') {
      return Result.failure(new Error('Download link is an empty string'));
    }

    const request = `${corsProxy}/?url=${encodeURIComponent(modDownloadLink)}`;
    console.log(request);

    try {
      const response = await fetch(request);
      if (!response.ok) {
        return Result.failure(
          new Error(
            `Failed downloading ${url}\nwith status code: ${response.status} ${response.statusText}`,
          ),
        );
      }
      return Result.success(response);
    } catch (ex) {
      return Result.failure(ex as Error);
    }
  }

  async #getModDownloadLink(modLink: string): Promise<string> {
    const gbModLink = modLink.match(/gamebanana.com\/mods\/(\d+)/);
    if (gbModLink) {
      try {
        const id = gbModLink[1];
        const fileData = (
          await (
            await fetch(
              `https://gamebanana.com/apiv11/Mod/${id}?_csvProperties=_aFiles`,
            )
          ).json()
        )._aFiles[0];
        return fileData._sDownloadUrl;
      } catch (ex) {
        console.warn(ex);
      }
    }

    return modLink;
  }
}
