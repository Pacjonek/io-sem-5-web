<template>
    <v-list two-line subheader>
        <v-list-tile
            v-for="item in primaryItems"
            :key="item.fileName"
            avatar
            @click="checkItem(item.fileName, checkMode, $event)"
        >
        <v-list-tile-action>
        <v-checkbox
            v-model="item.checked"
            @click="()=>false"
        ></v-checkbox>
        </v-list-tile-action>
        <v-list-tile-avatar>
            <v-icon class="blue white--text">assignment</v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content>
            <v-list-tile-title>{{ item.fileName }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ item.dateModified }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action align-center class="align-center" style="flex-direction:row">
            <v-btn @click="$emit('open-item', item.fileContent)" icon ripple>
                <v-icon color="grey lighten-1">get_app</v-icon>
            </v-btn>
            <v-btn @click="$emit('delete-item', item.fileName)" icon ripple>
                <v-icon color="grey lighten-1">delete</v-icon>
            </v-btn>
        </v-list-tile-action>
        </v-list-tile>
    </v-list>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import FileItem from '@/interfaces/FileItem';
@Component
export default class IPanel extends Vue {
    @Prop({type: Array, required: true}) private primaryItems!: FileItem[];
    @Prop({type: Array, required: true}) private secondaryItems!: FileItem[];
    @Prop({type: String, required: true}) private checkMode!: string;

    private checkItem(selectedfileName: string, checkMode: string, event?: Event) {
        if (event === undefined) { return; }
        const e = event.target as HTMLBaseElement;
        if (e.innerText === 'delete') { return; }
        if (checkMode === 'one') {
            let founds = 0;
            this.primaryItems.some((item, i, arr) => {
            this.secondaryItems.some((subitem, j, subarray) => {
                if (selectedfileName === subitem.fileName && subitem.checked) {
                    subarray[j].checked = false;
                    return true;
                }
                return false;
            });
            if (item.checked === true) {
                arr[i].checked = false;
                founds++;
            }
            if (selectedfileName === item.fileName && !item.checked) {
                arr[i].checked = true;
                founds++;
            }
            if (founds === 2) {
                return true;
            }
            return false;
            });
        } else if (checkMode === 'multiple') {
            this.primaryItems.some((item, i, arr) => {
                if (selectedfileName === item.fileName) {
                    if (this.secondaryItems.some((subitem) => {
                        if (subitem.checked === true && subitem.fileName === item.fileName) {
                            return true;
                        }
                        return false;
                    }) === false) {
                        arr[i].checked = !item.checked;
                    }
                    return true;
                }
                return false;
            });
        }
    }
}
</script>