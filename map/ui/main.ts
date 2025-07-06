import {CelesteMap} from '../mapTypes/celesteMap.js';
import {Level} from '../mapTypes/level.js';

const sidebar = document.getElementById('sidebar')!;
const bodyElement = document.getElementById('body')!;
const roomList = document.getElementById('roomList')!;

document.getElementById('openSidebarButton')!.onclick = toggleSidebar;
document.getElementById('closeSidebarButton')!.onclick = closeSidebar;

let sidebarIsOpen = false;

function toggleSidebar() {
  if (sidebarIsOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function openSidebar() {
  sidebarIsOpen = true;
  sidebar.style.width = '25dvw';
  bodyElement.style.marginLeft = '25dvw';
}

function closeSidebar() {
  sidebarIsOpen = false;
  sidebar.style.width = '0';
  bodyElement.style.marginLeft = '0';
}

export default class Sidebar {
  static clear() {
    roomList.innerHTML = '';
  }

  static addRoom(level: Level, onRoomSelect: (level: Level) => void) {
    const room = document.createElement('button');
    room.innerText = level.name;
    room.onclick = () => onRoomSelect(level);

    roomList.appendChild(room);
  }

  static setRooms(map: CelesteMap, onRoomSelect: (level: Level) => void) {
    this.clear();
    map.levels.forEach(level => {
      this.addRoom(level, onRoomSelect);
    });
  }
}
