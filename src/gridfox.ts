class Gridfox {
  private apikey: string =
    'teams.6NzsWeXVpICf9nAcfo2P4HVcqAQb1Yk6RMZ2B1cXBwyd8yTV9vpg1cMTMIZ0zx6y';

  config = (key?: string) => {
    if (key) {
      this.apikey = key;
    }
  };

  private readonly url = 'https://api.gridfox.com/';

  get headers() {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('gridfox-api-key', this.apikey);
    return headers;
  }

  async getTableRecords(tName: string) {
    const n = encodeURIComponent(tName);
    const p = new URLSearchParams();
    p.set('PageSize', '1000');
    const response = await fetch(`${this.url}data/${n}?${p.toString()}`, {
      headers: this.headers,
    });
    const data = await response.json();
    return data;
  }

  async getAllTables() {
    const response = await fetch(this.url + 'tables', {
      headers: this.headers,
    });
    const data = await response.json();
    return data;
  }
}

export default new Gridfox();
