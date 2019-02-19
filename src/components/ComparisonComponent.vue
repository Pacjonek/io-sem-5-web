<template>
  <v-container fluid>
     <v-alert
      :value="true"
      type="error"
      class="top-alert"
      v-if="$refs.upload && !$refs.upload.active && uploadStatus.errors">
      Wystąpił błąd w trackie próby przesyłania plików. Bardzo nam z tego powodu wszystko jedno.
    </v-alert>
    <v-layout v-if="firstItemsGetFinished" justify-space-between row>
      <v-flex xs4>
        <v-card>
          <h1 class="text-xs-center green white--text font-weight-light">PLIK ŹRÓDŁOWY</h1>
            <div class="d-flex">
              <v-btn small @click="addItem(true)">
                <i class="material-icons">add</i>
                Dodaj nowe pliki</v-btn>
            </div>
            <i-panel
            v-if="sourceAItems"
            check-mode="one"
            :primary-items="sourceAItems"
            :secondary-items="sourceBItems"
            @open-item="openItem"
            @delete-item="openDeleteDialog">
            </i-panel>
        </v-card>
      </v-flex>
      <v-flex xs3 text-xs-center>
        <v-card class="method-selector">
          <v-card-text>
          Wybierz plik który chcesz sprawdzić po lewej<br>
          Zaznacz pliki które chcesz porównywać po prawej<br><br>
          Wybierz strategię z listy:
          </v-card-text>
          <v-card-text>
            <v-select ref="strategies" required solo label="Nie wybrano" :items="strategies">
            </v-select>
          <div>
            <label for="minimum-similarity" class="d-block">Minimalny próg podobieństwa:</label>
            <input id="minimum-similarity" type="range" list="minimum-similarity__tickmarks" v-model="minimumSimilarity" min="50" max="100">
            <datalist id="minimum-similarity__tickmarks">
              <option value="50" label="50%"/>
              <option value="60"/>
              <option value="70"/>
              <option value="80"/>
              <option value="90"/>
              <option value="100" label="100%"/>
            </datalist>
            <span class="d-inline-block minimum-similarity__value">{{minimumSimilarity}} %</span>
          </div>

          </v-card-text>
          <v-dialog v-model="analiseDialog.opened" max-width="620px" ref="analiseDialog" 
          :disabled="readyToAnalise">
            <v-btn color="primary" slot="activator"
            @click="compare(getCheckedSourceAItem, getCheckedSourceBItems, $refs.strategies.lazyValue)"
            :disabled="readyToAnalise">Porównaj</v-btn>
              <v-card
                color="primary"
                dark
                v-if="analiseDialog.loading"
              >
                <v-card-text>
                  <div><strong>Analizowanie plików ...</strong></div>
                  <div>
                    Czy wiesz, że:
                    <i>{{funFacts[Math.floor(Math.random() * funFacts.length)]}}</i>
                  </div>
                  <v-progress-linear
                    indeterminate
                    color="white"
                    class="mb-0"
                  ></v-progress-linear>
                </v-card-text>
              </v-card>
              <v-card :class="{hidden:analiseDialog.loading}">
                <v-card-title class="headline pb-0">Uzyskane w wyniku pracy wyniki</v-card-title>
                <v-card-text class="pt-0">
                  <div id="latex-js__wrapper"></div>
                  <div class="text-xs-right">
                    <v-btn
                      color="primary"
                      :download="`report${Math.floor(Math.random() * 999)}.tex`"
                      :href="`data:text/plain;charset=utf-8,${encodeURIComponent(latexCode)}`"
                    >Pobierz raport w LateX</v-btn>
                    <v-btn @click="printReport()" >Drukuj / Eksportuj raport do PDF</v-btn>
                  </div>
                </v-card-text>
              </v-card>
          </v-dialog>
            <file-upload
            v-model="uploadStatus.uploadFiles"
            :post-action="`${apiUrl}/files`"
            accept=".tex"
            :multiple="true"
            ref="upload"
            @input-file="$refs.upload.active = true">
        </file-upload>
        </v-card>
      </v-flex>
      <v-flex xs4>
        <v-card>
          <h1 class="text-xs-center red white--text font-weight-light">PLIKI REFERENCYJNE</h1>
          <div class="d-flex">
            <v-btn small @click="selectAllfromSourceB(true)">Zaznacz wszystko</v-btn>
            <v-btn small @click="selectAllfromSourceB(false)">Odznacz wszystko</v-btn>
          </div>

           <i-panel
           v-if="sourceBItems"
            check-mode="multiple"
            :primary-items="sourceBItems"
            :secondary-items="sourceAItems"
            @open-item="openItem"
            @delete-item="openDeleteDialog">
            </i-panel>

        </v-card>
      </v-flex>
    </v-layout>
    <v-layout v-else justify-center align-center column>
        <p v-if="fatalErrorString" class="fatal-error__string">{{fatalErrorString}}</p>
        <template v-else>
          <v-progress-circular
            indeterminate
            color="red"></v-progress-circular>
          <p class="loading__string">Pierwsze ładowanie może potrwać trochę dłużej z powodu ograniczeń infrastruktury</p>
        </template>
    </v-layout>
    <v-dialog v-model="deleteDialog.opened" max-width="510px">              
      <v-card>
        <v-card-title class="headline">Czy jesteś pewien usunięcia {{deleteDialog.fileName}}?</v-card-title>
        <v-card-text>
          Plik zostanie usunięty z serwera nieodwracalnie.
        </v-card-text>
        <v-card-actions>
        <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat @click="deleteDialog.opened = false">Anuluj</v-btn>
          <v-btn color="red darken-1" flat @keyup.esc="deleteDialog.opened = false"
          @click="deleteItem(deleteDialog.fileName);deleteDialog.opened = false">Usuń</v-btn>
      </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-if="$refs.upload && $refs.upload.active"
      v-model="$refs.upload.active"
      persistent
      width="300px">
      <v-card :color="uploadStatus.background" dark>
        <v-card-text>
          Trwa wysyłanie plików...
          [{{uploadStatus.uploadProgress.finishedFilesCount}} / {{uploadStatus.uploadFiles.length}}]
          <v-progress-linear
            :value="uploadStatus.uploadProgress.finishedFilesPercentage"
            color="white"
            class="mb-0">
          </v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import FileUpload from 'vue-upload-component';
import FileItem from '@/interfaces/FileItem';
import IPanel from '@/components/IPanel.vue';

@Component({
    components: {
    IPanel,
    FileUpload,
  },
})
export default class ComparisonComponent extends Vue {

  @Prop({type: String, required: true}) private apiUrl!: string;

  private funFacts = [
    'Wszyscy umrzemy',
    'Indie mają kartę praw krów',
    'W USA 97 ludzi nazywa się LOL',
    'Ludzkie DNA jest w 50% podobne do DNA banana',
    'Króliki większość czasu spędzają na kopulacji',
    'Jedi jest oficjalną religią 70 tys. Australijczyków',
    'Władze w Chinach prawnie zakazały przytulania drzew',
    'Mężczyźni sześć razy częściej są rażeni piorunem niż kobiety',
    'Pierwsze rakiety do tenisa robiono z krowich i owczych jelit',
    'W amerykańskim stanie Ohio prawnie zakazano upajanie ryb alkoholem',
  ];
  private firstItemsGetFinished = false;
  private fatalErrorString = '';
  private analiseDialog = {
    opened: false,
    loading: true,
  };
  private loadingDialog = true;
  private deleteDialog = {
    opened: false,
    fileName: '',
    background: 'green',
  };
  private uploadStatus = {
    finishedFilesCount: 0,
    finishedFilesPercentage: 0,
    uploadFiles: [] as any,
    errors: false,
    get background() {
      if (this.errors === true) { return 'red'; }
      return 'green';
    },
    get uploadProgress() {
      let sum = 0;
      let count = 0;
      for (const row of this.uploadFiles) {
        if (row.success) {
          count++;
        }
        if (row.error !== '') {
          this.errors = true;
          console.warn('Error during uploading one of the files.');
        }
        sum += Number(row.progress);
      }
      if (count === this.uploadFiles.length - 1) {
        this.onSuccess();
      }
      return {
        finishedFilesCount: count,
        finishedFilesPercentage: sum / this.uploadFiles.length,
      };
  },
  onSuccess: this.getItems,
  };

  private minimumSimilarity = 50;
  private items: FileItem[] = [];
  private sourceAItems: FileItem[] = [];
  private sourceBItems: FileItem[] = [];
  private strategies: string[] = [];

  private latexCode = '';

  private openDeleteDialog(fileName: string) {
    this.deleteDialog.opened = true;
    this.deleteDialog.fileName = fileName;
  }
  private openItem(fileContentUrl: string) {
    window.location.replace(fileContentUrl);
  }

  private async deleteItem(targetfileName: string) {
    const del = (arr: FileItem[]) => {
      return arr.filter((element: FileItem) => {
        if (targetfileName === element.fileName) {
          return false;
        }
        return true;
      });
    };
    try {
      await Vue.axios.delete(`${this.apiUrl}/files/${encodeURI(targetfileName)}`);
      this.sourceAItems = del(this.sourceAItems);
      this.sourceBItems = del(this.sourceBItems);
    } catch (err) {
      alert(`Nie można było usunąć pliku.\n${err}`);
      console.warn(err);
    }
  }

  private addItem() {
    const upload = this.$refs.upload as any;
    this.uploadStatus.uploadFiles = [];
    this.uploadStatus.errors = false;
    upload.$el.querySelector('input').click();
  }

  private selectAllfromSourceB(noReverse: boolean = true) {
    this.sourceBItems.forEach((item, i, arr) => {
      if (noReverse && !this.sourceAItems[i].checked) {
        item.checked = true;
      } else {
        item.checked = false;
      }
    });
  }

  private get readyToAnalise() {
    const strategiesComponent = this.$refs.strategies as any;
    return !this.getCheckedSourceAItem
    || this.getCheckedSourceBItems.length === 0
    || strategiesComponent.selectedItems.length === 0;
  }

  private get getCheckedSourceAItem(): FileItem | null {
    return this.sourceAItems.find((el) => el.checked === true) || null;
  }

  private get getCheckedSourceBItems(): FileItem[] {
    return this.sourceBItems.filter((el) => el.checked === true);
  }

  private async getItems() {
    try {
      const response = await Vue.axios.get(`${this.apiUrl}/files`);
      this.items = response.data;
      this.items.forEach((item, i, arr) => {
        arr[i].dateModified = item.dateModified.slice(0, 10);
        arr[i].checked = false;
      });
      const strItem = JSON.stringify(this.items);
      this.sourceAItems = JSON.parse(strItem);
      this.sourceBItems = JSON.parse(strItem);
    } catch (err) {
      this.fatalErrorString = `Nie można było pobrać strategii.\n${err}`;
      throw new Error(err);
    }
  }
  private async getStrategies() {
    try {
      const response = await Vue.axios.get(`${this.apiUrl}/strategies`);
      this.strategies = response.data;
    } catch (err) {
      this.fatalErrorString = `Nie można było pobrać strategii.\n${err}`;
      throw new Error(err);
    }
  }
  private async compare(sourceAItem: FileItem, sourceBItems: FileItem[], strategy: string) {
      try {
        this.analiseDialog.loading = true;
        const sourceBFileNameItems = sourceBItems.map((item) => {
          return item.fileName;
        });
        const response = await Vue.axios.post(`${this.apiUrl}/compare`, {
          fileToCompare: sourceAItem.fileName,
          otherFiles: sourceBFileNameItems,
          strategy,
          minimumSimilarity: this.minimumSimilarity,
        });
        const latexJSWrapper = document.getElementById('latex-js__wrapper');
        const latexJSComponent = document.createElement('latex-js');
        if (latexJSWrapper === null) {
          throw new Error('No wrapper found for latex-js componnent');
        }
        latexJSComponent.id = 'latex-js__code';
        latexJSWrapper.innerHTML = '';
        this.latexCode = response.data;
        latexJSComponent.innerHTML = this.latexCode;
        latexJSWrapper.appendChild(latexJSComponent);
      } catch (err) {
        this.analiseDialog.opened = false;
        alert(`Nie można było dokonać porównania.\n${err}`);
        throw new Error(err);
    } finally {
      setTimeout(() => {
        this.analiseDialog.loading = false;
      }, 1000);
    }
  }

  private printReport() {
    const newWindow = window.open();
    if (newWindow === null) {
      return;
    }
    const latexComponent = document.getElementById('latex-js__code');
    if (latexComponent === null || latexComponent.shadowRoot === null) {
      return;
    }
    newWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>report${Math.floor(Math.random() * 999)}</title>
      </head>
      <body>
        ${latexComponent.shadowRoot.innerHTML}
        <script>
          setTimeout(() => {

            //TODO: Remove this "bypass" and investigate what the problem is
            if(navigator.userAgent.toLowerCase().includes('firefox')) window.stop();
            else alert('Jeżeli chcesz wyeksportować raport do PDF z listy wybierz drukarkę PDF');

            window.print()
            window.close();
          },1000);
        <\/script>
      </body>
    </html>`);
  }
  private async mounted() {
    this.getStrategies();
    await this.getItems();
    this.firstItemsGetFinished = true;
  }

}
</script>
<style scoped>
.top-alert{
  padding:8px 16px;
  margin-top:0
}
.method-selector{
  top:80px
}
.loading__string{
  margin-top:1rem
}
.fatal-error__string{
  margin-top:1rem;
  color:red
}
.minimum-similarity__value{
  width:50px
}
.hidden{
  display:none !important
}
</style>