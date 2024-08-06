import styles from './index.css';

enum AnimeType {
  tv = 'tv',
  movie = 'movie',
  special = 'special',
  ona = 'ona',
  music = 'music',
  cm = 'cm',
  pv = 'pv',
  tv_special = 'tv_special',
}

class AppContainer extends HTMLElement {
  private form!: HTMLFormElement;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>${styles}</style>
        <div id="form-container">
          <form id="anime-form">
            <label for="type">Type:</label>
            <select id="type" name="type">
              <option value="">Seleccione un tipo</option>
              ${Object.values(AnimeType).map(type => `<option value="${type}">${type}</option>`).join('')}
            </select>

            <label for="query">Query:</label>
            <input type="text" id="query" name="query" />

            <label for="limit">Limit:</label>
            <input type="number" id="limit" name="limit" />

            <button type="submit">Search</button>
          </form>
          <button id="clear-results">Clear Results</button>
        </div>
        <div id="results"></div>
      `;

      this.form = this.shadowRoot.querySelector('#anime-form') as HTMLFormElement;
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    
      const clearButton = this.shadowRoot.querySelector('#clear-results') as HTMLButtonElement;
      clearButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.clearResults();
      });
    }
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    const formData = new FormData(this.form);
    const type = formData.get('type') as string;
    const query = formData.get('query') as string;
    const limit = formData.get('limit') ? Number(formData.get('limit')) : undefined;

    if (!query && !type && (limit === undefined || limit <= 0)) {
      alert('Por favor, llene al menos uno de los campos.');
      return;
    }

    const url = this.getUrlSerch(type, query, limit);
    console.log(url);

    const data = await this.getData(url);
    console.log(data);

    this.addContent(data);
  }

  getUrlSerch(type: string, query: string, limit?: number) {
    const queryParams: string[] = [];

    if (query) queryParams.push(`q=${encodeURIComponent(query)}`);
    if (type) queryParams.push(`type=${encodeURIComponent(type)}`);
    if (limit !== undefined && limit > 0) queryParams.push(`limit=${limit}`);

    const baseUrl = 'https://api.jikan.moe/v4/anime';
    const url = queryParams.length ? `${baseUrl}?${queryParams.join('&')}` : baseUrl;

    return url;
  }

  async getData(url: string) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error in get data: " + error);
    }
  }

  addContent(data: any) {
    const resultsContainer = this.shadowRoot?.querySelector('#results');
    if (!resultsContainer) return;
  
    resultsContainer.innerHTML = '';
  
    if (data && data.data && data.data.length > 0) {
      data.data.forEach((item: any) => {
        const title = item.title || 'No Title';
        const type = item.type || 'No Type';
  
        const itemElement = document.createElement('div');
        itemElement.innerHTML = `
          <p><b>Title: </b>${title}</p>
          <p><b>Type: </b>${type}</p>
        `;
        resultsContainer.appendChild(itemElement);
      });
    } else {
      const noDataMessage = document.createElement('p');
      noDataMessage.textContent = 'No se encontraron datos.';
      resultsContainer.appendChild(noDataMessage);
    }
  }
  
  clearResults() {
    const resultsContainer = this.shadowRoot?.querySelector('#results');
    if (resultsContainer) {
      resultsContainer.innerHTML = '';
    }
  }
}

customElements.define('app-container', AppContainer);
