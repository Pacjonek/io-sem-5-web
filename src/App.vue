<template>
  <v-app>
    
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>io-sem-5-</span>
        <span class="font-weight-light">frontend – Wyszukiwanie plagiatów w dokumentach Latex</span>
      </v-toolbar-title>
    </v-toolbar>

    <v-content>
      <ComparisonComponent :api-url="API_URL"/>
    </v-content>

  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ComparisonComponent from './components/ComparisonComponent.vue';

@Component({
  components: {
    ComparisonComponent,
  },
})
export default class App extends Vue {
  private API_URL = 'http://localhost:9005';
}
</script>