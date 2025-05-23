const corsProxy = 'https://cors-header-proxy.izumiano.workers.dev';

export default class ModDownloader {
  async download(url: string) {
    const modDownloadLink = await this.#getModDownloadLink(url);

    if (modDownloadLink === '') {
      throw new Error('Download link is an empty string');
    }

    const request = `${corsProxy}/?url=${encodeURIComponent(modDownloadLink)}`;
    console.log(request);

    return await fetch(request);
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
