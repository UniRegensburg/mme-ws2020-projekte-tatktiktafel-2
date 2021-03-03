const SEARCH_URL = "https://api.thecatapi.com/v1/images/search";


class ApiClient {

    async getRandomImageUrl() {
        let response = await fetch(SEARCH_URL),
            result = await response.json();
        return result[0].url;
    }

    getRandomImage() {
        let that = this;
        return new Promise(function(resolve, reject) {
            that.getRandomImageUrl().then(function(url) {
                let image = new Image();
                image.onload = () => resolve(image);
                image.src = url;
            });
        });
    }

}

export default new ApiClient();