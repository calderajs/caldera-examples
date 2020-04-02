import React, { useState } from "react";
import {
  renderCalderaApp,
  useLocation,
  Head,
  useSharedState,
  useHistory
} from "caldera";
import style from "./style";
import NavBar from "./NavBar";
import AccountPic from "./AccountPic";
import MooBox from "./MooBox";
import Login from "./Login";
import NewMoo from "./NewMoo";
import { MooAccount } from "./Account";
import { MooType } from "./Moo";
import { makeMooResource } from "./twudderResources";

const moosResource = makeMooResource([]);

const Moo = ({ moo }: { moo: MooType }) => {
  const history = useHistory();
  const initial: (string | JSX.Element)[] = [""];
  const tagClick = (tag: string, word: string) => () =>
    history.push(`/search?${tag}=${word}`);
  const tokenizedMooText = moo.text.split(" ").reduce((acc, w) => {
    if (
      (w[0] === "@" || w[0] === "#") &&
      w.length > 1 &&
      w.slice(1).startsWith(w.replace(/\W/g, ""))
    ) {
      const index = w.replace(/\W/g, "").length + 1;
      acc.push(
        <span
          onClick={tagClick(
            w[0] === "@" ? "mention" : "tags",
            w.replace(/\W/g, "")
          )}
          style={{ color: "#54C1FF", cursor: "pointer" }}
        >
          {w.slice(0, index)}
        </span>,
        `${w.slice(index)} `
      );
    } else acc[acc.length - 1] = acc[acc.length - 1] + w + " ";
    return acc;
  }, initial);

  return (
    <MooBox>
      <div className="moo">
        <div className="account">
          <AccountPic username={moo.account.username} name={moo.account.name} />
          <div className="account-name-wrapper">
            <div className="account-name">{moo.account.name}</div>
            <div className="account-id">{`@${moo.account.username}`}</div>
          </div>
        </div>
        <div className="moo-content">{tokenizedMooText}</div>
      </div>
    </MooBox>
  );
};

const Feed = ({
  account,
  filter
}: {
  account: MooAccount | null;
  filter: string;
}) => {
  const [moos, addNewMoo] = useSharedState(moosResource);
  const searchParams = new URLSearchParams(filter.slice(1));

  const filterMoos = ({ account, tags, mentions }: MooType) => {
    if (filter === "") return true;
    const searchMention = searchParams.get("mention");
    const searchTag = searchParams.get("tags");

    if (searchMention !== null)
      return (
        account.username === searchParams.get("mention") ||
        mentions.includes(searchMention)
      );
    if (searchTag !== null) return tags.includes(searchTag);
    return false;
  };

  return (
    <div className="feed-outer">
      <div className="feed-inner">
        {account ? (
          <NewMoo addNewMoo={addNewMoo} account={account} moos={moos} />
        ) : null}
        {moos.filter(filterMoos).map(m => (
          <Moo moo={m} />
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [account, setAccount] = useState<MooAccount | null>(null);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const location = useLocation();

  return (
    <div id="twudder-app" onClick={() => setShowLoginMenu(false)}>
      <Head>
        <title>Twudder</title>
        <link
          href="https://fonts.googleapis.com/css?family=Roboto&display=swap"
          rel="stylesheet"
        />
        <style>{style}</style>
      </Head>
      <NavBar
        account={account}
        setAccount={setAccount}
        setShowLoginMenu={setShowLoginMenu}
        showLoginMenu={showLoginMenu}
      />
      {showLoginMenu ? (
        <Login setShowLoginMenu={setShowLoginMenu} setAccount={setAccount} />
      ) : (
        <></>
      )}
      <Feed account={account} filter={location.search} />
    </div>
  );
};

renderCalderaApp(<App />);
