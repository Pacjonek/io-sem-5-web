import Vue from 'vue';
import Vuetify from 'vuetify';
import pl from 'vuetify/src/locale/pl';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify, {
  lang: {
    locales: { pl },
    current: 'pl',
  },
  theme: {
    primary: '#ee44aa',
    secondary: '#424242',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
  },
  iconfont: 'md',
});
