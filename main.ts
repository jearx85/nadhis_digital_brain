import { Plugin, Notice, App, Modal, Setting, TFile, TFolder, Vault, TAbstractFile } from "obsidian";
import { query } from './funciones';
import { ExampleView, VIEW_TYPE_EXAMPLE } from "./view";

export default class ExamplePlugin extends Plugin {
    // client = conn();
    currentNote: any = null;

    async onload() {
        console.log("plugin loaded");

        this.activateView();
        this.registerView(
            VIEW_TYPE_EXAMPLE,
            (leaf) => new ExampleView(leaf)

        );

        
    }


    async onunload() {
        console.log("plugin unloaded");
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);
    }

    async activateView() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);

        await this.app.workspace.getRightLeaf(false).setViewState({
            type: VIEW_TYPE_EXAMPLE,
            active: true,
        });

        this.app.workspace.revealLeaf(
            this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0]
        );

    }


}

