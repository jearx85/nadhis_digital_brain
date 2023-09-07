import { Plugin, Notice, App, Modal, Setting, TFile, TFolder, Vault, TAbstractFile } from "obsidian";
import { NadhisView, NADHIS_VIEW } from "./view";

export default class ExamplePlugin extends Plugin {
    // client = conn();
    currentNote: any = null;


    async onload() {
        console.log("plugin loaded");

        this.registerView(
            NADHIS_VIEW,
            (leaf) => new NadhisView(leaf)
            
        );
            this.activateView();
        }


   

    async onunload() {
        console.log("plugin unloaded");
        this.app.workspace.detachLeavesOfType(NADHIS_VIEW);
    }

    async activateView() {
        this.app.workspace.detachLeavesOfType(NADHIS_VIEW);

        await this.app.workspace.getRightLeaf(false).setViewState({
            type: NADHIS_VIEW,
            active: true,
        });

        this.app.workspace.revealLeaf(
            this.app.workspace.getLeavesOfType(NADHIS_VIEW)[0]
        );

    }
}




